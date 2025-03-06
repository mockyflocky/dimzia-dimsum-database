
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';

const CartIcon = () => {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/checkout');
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-40"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative bg-dimzia-primary text-white p-4 rounded-full shadow-lg"
        onClick={handleClick}
      >
        <ShoppingCart size={24} />
        {totalItems > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-dimzia-dark text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
          >
            {totalItems}
          </motion.span>
        )}
      </motion.button>
    </motion.div>
  );
};

export default CartIcon;
