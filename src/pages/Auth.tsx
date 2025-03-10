
import { useState } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '@/integrations/firebase/client';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, signIn, isAdmin } = useFirebaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Admin credentials
  const ADMIN_EMAIL = 'admin@example.com';
  const ADMIN_PASSWORD = 'wicept53aman';

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const createAdminUserRecord = async (userId: string) => {
    try {
      console.log("Attempting to create admin user record for user ID:", userId);
      
      // Create admin record in Firestore
      await setDoc(doc(firestore, "admin_users", userId), {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Sign in with Firebase
      await signIn(email, password);
      navigate('/admin');
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
