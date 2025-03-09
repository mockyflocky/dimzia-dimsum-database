
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

  // Admin credentials
  const ADMIN_EMAIL = 'admin@example.com';
  const ADMIN_PASSWORD = 'wicept53aman';

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const createAdminUserRecord = async (userId) => {
    try {
      console.log("Attempting to create admin user record for user ID:", userId);
      
      // Check if admin record already exists for this user
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error("Error checking for existing admin:", checkError);
        throw checkError;
      }
      
      // If admin record already exists, return
      if (existingAdmin) {
        console.log("Admin record already exists:", existingAdmin);
        return;
      }
      
      // Insert admin record
      const { data, error } = await supabase
        .from('admin_users')
        .insert([{ user_id: userId }])
        .select();
      
      if (error) {
        console.error("Failed to create admin record:", error);
        throw error;
      }
      
      console.log("Successfully created admin user record:", data);
      return data;
    } catch (error) {
      console.error("Error in createAdminUserRecord:", error);
      toast({
        title: "Failed to create admin record",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  };

  const handleAdminDirectSignIn = async () => {
    try {
      // First, check if the user exists by trying to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      });
      
      if (signInError) {
        // If sign in fails because user doesn't exist, create the user
        if (signInError.message?.includes('Invalid login credentials')) {
          console.log("Admin user doesn't exist, creating...");
          
          // Create admin user with direct sign up
          // Note: This will create a user without requiring email verification
          const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            email_confirm: true, // Skip email verification
            user_metadata: { role: 'admin' }
          });
          
          if (adminError) {
            throw adminError;
          }
          
          if (adminData?.user) {
            // Create the admin user record
            await createAdminUserRecord(adminData.user.id);
            
            // Sign in with the new account
            await signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
            navigate('/admin');
            
            toast({
              title: "Admin account created",
              description: "Successfully created and logged in as admin",
            });
          }
        } else {
          throw signInError;
        }
      } else if (signInData?.user) {
        // User exists, create admin record if needed
        await createAdminUserRecord(signInData.user.id);
        
        // Update the Auth context
        navigate('/admin');
        
        toast({
          title: "Logged in successfully",
          description: "Welcome back, admin!",
        });
      }
    } catch (error) {
      console.error("Admin authentication error:", error);
      toast({
        title: "Admin login failed",
        description: error.message || "Please check Supabase permissions",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // For admin credentials, use the direct method
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        await handleAdminDirectSignIn();
      } else {
        // For non-admin users, use the regular sign-in flow
        await signIn(email, password);
        navigate('/admin');
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

          <div className="text-center text-sm text-gray-600">
            <p>Default admin: admin@example.com</p>
            <p>Default password: wicept53aman</p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Auth;
