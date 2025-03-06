
import React from 'react';
import { motion } from 'framer-motion';
import { FoodItem as FoodItemType } from '@/lib/data';
import { cn } from '@/lib/utils';

interface FoodItemProps {
  item: FoodItemType;
  index: number;
}

const FoodItem: React.FC<FoodItemProps> = ({ item, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {item.isPopular && (
          <div className="absolute top-2 right-2 bg-dimzia-primary text-white text-xs font-semibold px-2 py-1 rounded-full">
            Popular
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-lg font-medium text-gray-900 group-hover:text-dimzia-primary transition-colors">
            {item.name}
          </h3>
          <span className="font-medium text-dimzia-primary">
            ${item.price.toFixed(2)}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            {
              'bg-blue-100 text-blue-800': item.category === 'steamed',
              'bg-orange-100 text-orange-800': item.category === 'fried',
              'bg-yellow-100 text-yellow-800': item.category === 'baked',
              'bg-pink-100 text-pink-800': item.category === 'dessert',
              'bg-purple-100 text-purple-800': item.category === 'special',
            }
          )}>
            {item.category}
          </span>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm font-medium text-white bg-dimzia-primary hover:bg-dimzia-dark rounded-full px-3 py-1 transition-colors"
          >
            Order
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default FoodItem;
