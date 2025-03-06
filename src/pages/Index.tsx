
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedText from '@/components/AnimatedText';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-10 text-gray-900"
        >
          <AnimatedText 
            text="Dimzia Dimsum" 
            type="char" 
            animation="slide" 
            delay={0.04}
          />
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          <Link 
            to="/catalog" 
            className="bg-dimzia-primary hover:bg-dimzia-dark text-white px-8 py-4 rounded-full font-medium transition-colors flex items-center gap-2 mx-auto w-fit text-lg"
          >
            View Our Menu <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
