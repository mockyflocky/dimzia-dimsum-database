
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedText from '@/components/AnimatedText';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold mb-6 text-gray-900"
        >
          <AnimatedText 
            text="Dimzia Dimsum" 
            type="char" 
            animation="slide" 
            delay={0.04}
          />
        </motion.h1>
        
        <motion.div
          className="relative mb-10"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <div className="h-1 w-24 bg-dimzia-primary mx-auto rounded-full"></div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.2 }}
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
