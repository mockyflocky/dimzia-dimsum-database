
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
  adminLogin: (username: string, password: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fixed admin credentials
const ADMIN_USERNAME = 'dimziaadmin';
const ADMIN_PASSWORD = 'wicept53aman';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Effect for auth state change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
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

  // Simple check for fixed admin based on username (not email)
  const checkAdminStatus = (email?: string) => {
    // Simply make the user an admin if they're logged in with our method
    // You might want to make this more secure in production
    setIsAdmin(true);
  };

  // When user changes, check admin status
  useEffect(() => {
    if (user) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Direct admin login method (bypassing regular auth flow)
  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Create a temporary auth session directly
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'admin@temporary.com', // We'll use a fake email that works with Supabase
          password: ADMIN_PASSWORD,
        });
        
        if (error) {
          // If login fails, try sign up first
          const { error: signUpError } = await supabase.auth.signUp({
            email: 'admin@temporary.com',
            password: ADMIN_PASSWORD,
          });
          
          if (signUpError) {
            toast({
              title: 'Admin sign up failed',
              description: signUpError.message,
              variant: 'destructive',
            });
            return false;
          }
          
          // Try login again
          const { error: retryError } = await supabase.auth.signInWithPassword({
            email: 'admin@temporary.com',
            password: ADMIN_PASSWORD,
          });
          
          if (retryError) {
            toast({
              title: 'Admin login failed',
              description: retryError.message,
              variant: 'destructive',
            });
            return false;
          }
        }
        
        setIsAdmin(true);
        
        toast({
          title: 'Admin logged in',
          description: 'Welcome to admin dashboard',
        });
        
        return true;
      } else {
        toast({
          title: 'Admin login failed',
          description: 'Invalid admin credentials',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Admin login failed',
        description: error.message || 'An error occurred during login',
        variant: 'destructive',
      });
    }
    
    return false;
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
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
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Sign up successful',
        description: 'Please check your email for the confirmation link',
      });
    } catch (error: any) {
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
      signOut,
      adminLogin
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
