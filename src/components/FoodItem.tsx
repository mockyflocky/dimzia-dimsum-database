
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FoodItem as FoodItemType } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface FoodItemProps {
  item: FoodItemType;
  index: number;
}

const FoodItem: React.FC<FoodItemProps> = ({ item, index }) => {
  const [count, setCount] = useState(0);
  const { addToCart } = useCart();

  const incrementCount = () => {
    setCount(prev => prev + 1);
  };

  const decrementCount = () => {
    if (count > 0) {
      setCount(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (count > 0) {
      addToCart(item, count);
      setCount(0);
    }
  };

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
            Rp {(item.price * 15000).toLocaleString('id-ID')}
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
          
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={decrementCount}
                className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
                disabled={count === 0}
              >
                <Minus size={16} className={count === 0 ? "opacity-50" : ""} />
              </motion.button>
              
              <span className="px-2 min-w-[30px] text-center">
                {count}
              </span>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={incrementCount}
                className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
              >
                <Plus size={16} />
              </motion.button>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm font-medium text-white bg-dimzia-primary hover:bg-dimzia-dark rounded-full p-2 transition-colors"
              onClick={handleAddToCart}
              disabled={count === 0}
            >
              <ShoppingCart size={16} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FoodItem;
