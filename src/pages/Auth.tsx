
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Admin credentials - updated to use valid email format
  const ADMIN_EMAIL = 'admin@example.com';
  const ADMIN_PASSWORD = 'wicept53aman';

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Attempting login with email:", email, "password:", password ? "***" : "");

    try {
      // Check if credentials match the fixed admin user
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        try {
          // Try to sign in first
          console.log("Attempting to sign in admin user");
          await signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
          navigate('/admin');
        } catch (signInErr: any) {
          console.log("Sign in attempt error:", signInErr);
          
          // If sign in fails, try to sign up
          if (signInErr.message?.includes('Invalid login credentials')) {
            try {
              console.log("Attempting to sign up admin user");
              const { error: signUpError } = await supabase.auth.signUp({ 
                email: ADMIN_EMAIL, 
                password: ADMIN_PASSWORD 
              });
              
              if (signUpError) {
                console.log("Sign up attempt error:", signUpError);
                
                // If the error is about the email being invalid, it's likely a Supabase configuration issue
                if (signUpError.message?.includes('Email address') && signUpError.message?.includes('is invalid')) {
                  toast({
                    title: "Authentication configuration issue",
                    description: "Please contact the administrator to configure Supabase authentication properly.",
                    variant: "destructive"
                  });
                  
                  throw signUpError;
                }
              } else {
                console.log("Sign up successful, attempting to sign in again");
              }
              
              // Try to sign in again after sign up
              await signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
              navigate('/admin');
            } catch (signUpErr) {
              console.log("Sign up error:", signUpErr);
              throw signUpErr;
            }
          } else {
            throw signInErr;
          }
        }
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your menu
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-dimzia-primary focus:border-dimzia-primary focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-dimzia-primary focus:border-dimzia-primary focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Processing...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Auth;
