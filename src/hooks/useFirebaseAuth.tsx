
import { useState, useEffect, createContext, useContext } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '@/integrations/firebase/client';
import { useToast } from './use-toast';

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin tetap hardcoded seperti pada kode sebelumnya
const ADMIN_EMAIL = 'admin@example.com';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser?.email);
      setUser(currentUser);
      
      if (currentUser) {
        checkAdminStatus(currentUser.email);
      } else {
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Memeriksa apakah pengguna adalah admin
  const checkAdminStatus = async (email?: string | null) => {
    // Cek sederhana untuk admin email yang hardcoded
    const isAdminUser = email === ADMIN_EMAIL;
    console.log("Checking admin status for:", email, "Result:", isAdminUser);
    setIsAdmin(isAdminUser);
    
    if (isAdminUser && user) {
      // Pastikan record admin ada di Firestore
      await createAdminUserRecord(user.uid);
    }
  };

  // Membuat record admin user di Firestore
  const createAdminUserRecord = async (userId: string) => {
    try {
      console.log("Attempting to create admin user record for user ID:", userId);
      
      // Cek apakah record admin sudah ada
      const adminDocRef = doc(firestore, "admin_users", userId);
      const adminDocSnap = await getDoc(adminDocRef);
      
      if (adminDocSnap.exists()) {
        console.log("Admin record already exists:", adminDocSnap.data());
        return;
      }
      
      // Membuat record admin
      await setDoc(adminDocRef, { 
        user_id: userId,
        created_at: new Date().toISOString()
      });
      
      console.log("Successfully created admin user record");
    } catch (error: any) {
      console.error("Error in createAdminUserRecord:", error);
      toast({
        title: "Failed to create admin record",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting sign in with:", email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      if (email === ADMIN_EMAIL) {
        await createAdminUserRecord(result.user.uid);
      }
      
      toast({
        title: 'Signed in successfully',
        description: 'Welcome back!',
      });
    } catch (error: any) {
      console.error("Sign in catch error:", error);
      toast({
        title: 'Sign in failed',
        description: error.message || 'An error occurred during sign in',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Attempting sign up with:", email);
      await createUserWithEmailAndPassword(auth, email, password);
      
      toast({
        title: 'Sign up successful',
        description: 'Your account has been created',
      });
    } catch (error: any) {
      console.error("Sign up catch error:", error);
      toast({
        title: 'Sign up failed',
        description: error.message || 'An error occurred during sign up',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      
      toast({
        title: 'Signed out successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message || 'An error occurred during sign out',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin,
      isLoading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within an AuthProvider');
  }
  
  return context;
};
