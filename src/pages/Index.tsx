
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedText from '@/components/AnimatedText';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { getPopularItems } from '@/lib/data';
import FoodItem from '@/components/FoodItem';

const Index = () => {
  const popularItems = getPopularItems();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const scrollToContent = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-dimzia-light opacity-70"></div>
        
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-3"
          >
            <span className="bg-dimzia-primary text-white text-xs font-medium px-3 py-1 rounded-full">
              Authentic Dim Sum
            </span>
          </motion.div>
          
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900">
            <AnimatedText 
              text="Dimzia Dimsum" 
              type="char" 
              animation="slide" 
              delay={0.04}
            />
          </h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-lg md:text-xl text-gray-700 mb-8 max-w-xl mx-auto"
          >
            Experience the refined art of dim sum in every delicate bite. Handcrafted perfection served with passion.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              to="/catalog" 
              className="bg-dimzia-primary hover:bg-dimzia-dark text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2"
            >
              View Our Menu <ArrowRight size={16} />
            </Link>
            
            <button 
              onClick={scrollToContent}
              className="text-dimzia-dark hover:text-dimzia-primary flex items-center gap-2 px-6 py-3 transition-colors"
            >
              Learn More <ChevronDown size={16} />
            </button>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-0 right-0 flex justify-center"
        >
          <button 
            onClick={scrollToContent}
            className="animate-bounce text-dimzia-dark hover:text-dimzia-primary"
            aria-label="Scroll down"
          >
            <ChevronDown size={28} />
          </button>
        </motion.div>
      </section>
      
      {/* Popular Items Section */}
      <section 
        ref={scrollRef} 
        className="py-16 md:py-24 px-4 bg-gradient-to-b from-white to-gray-50"
      >
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Most Popular Dim Sum
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-gray-600 max-w-xl mx-auto"
            >
              Discover our guests' favorites, each crafted with care and authentic flavors
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularItems.slice(0, 3).map((item, index) => (
              <FoodItem key={item.id} item={item} index={index} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/catalog" 
              className="inline-flex items-center gap-2 text-dimzia-primary hover:text-dimzia-dark dimzia-link font-medium transition-colors"
            >
              View Full Catalog <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
