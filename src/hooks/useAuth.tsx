
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from './use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hard-coded admin credentials
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'wicept53aman';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      console.log("Initial session:", initialSession?.user?.email);
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        checkAdminStatus(initialSession.user.email);
      }
      
      setIsLoading(false);
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Simple check for fixed admin
  const checkAdminStatus = (email?: string) => {
    const isAdminUser = email === ADMIN_EMAIL;
    console.log("Checking admin status for:", email, "Result:", isAdminUser);
    setIsAdmin(isAdminUser);
  };

  // When user changes, check admin status
  useEffect(() => {
    if (user) {
      checkAdminStatus(user.email);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting sign in with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error("Sign in error:", error.message);
        throw error;
      }
      
      if (data.user) {
        checkAdminStatus(data.user.email);
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
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        console.error("Sign up error:", error.message);
        throw error;
      }
      
      toast({
        title: 'Sign up successful',
        description: 'Please check your email for the confirmation link',
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
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
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
      session,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
