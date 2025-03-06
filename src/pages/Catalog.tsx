
import React from 'react';
import { motion } from 'framer-motion';
import { foodItems } from '@/lib/data';
import FoodItem from '@/components/FoodItem';
import AnimatedText from '@/components/AnimatedText';

const Catalog = () => {
  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <section className="bg-gradient-to-r from-dimzia-light to-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-serif text-3xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              <AnimatedText text="Our Dim Sum Catalog" type="word" animation="slide" />
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-gray-600 max-w-xl mx-auto"
            >
              Explore our extensive selection of handcrafted dim sum, made with authentic recipes
            </motion.p>
          </div>
        </div>
      </section>
      
      {/* Food Items Grid */}
      <section className="py-12 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {foodItems.map((item, index) => (
            <FoodItem key={item.id} item={item} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Catalog;
