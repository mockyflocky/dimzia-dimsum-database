
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-dimzia-light px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <h1 className="text-9xl font-serif font-bold text-dimzia-primary mb-4">404</h1>
        <p className="text-2xl text-gray-800 mb-6 font-serif">Page Not Found</p>
        <p className="text-gray-600 mb-8">
          We couldn't find the page you were looking for. It might have been moved or deleted.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-dimzia-primary hover:bg-dimzia-dark text-white px-5 py-2.5 rounded-full font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Return Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
