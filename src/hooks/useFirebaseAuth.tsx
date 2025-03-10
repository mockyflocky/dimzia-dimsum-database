
import { useState, useEffect, createContext, useContext } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
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

// Hard-coded admin credentials (same as before)
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'wicept53aman';

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

  // Check if user is admin
  const checkAdminStatus = async (email?: string | null) => {
    // Simple check for fixed admin email
    const isAdminUser = email === ADMIN_EMAIL;
    console.log("Checking admin status for:", email, "Result:", isAdminUser);
    setIsAdmin(isAdminUser);
    
    if (isAdminUser && user) {
      // Ensure admin record exists in Firestore
      await createAdminUserRecord(user.uid);
    }
  };

  // Create admin user record in Firestore
  const createAdminUserRecord = async (userId: string) => {
    try {
      console.log("Attempting to create admin user record for user ID:", userId);
      
      // Check if admin record already exists
      const adminDocRef = doc(firestore, "admin_users", userId);
      const adminDocSnap = await getDoc(adminDocRef);
      
      if (adminDocSnap.exists()) {
        console.log("Admin record already exists:", adminDocSnap.data());
        return;
      }
      
      // Create admin record
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
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
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
