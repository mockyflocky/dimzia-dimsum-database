
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem } from '@/lib/data';
import { useToast } from './use-toast';

export interface CartItem {
  item: FoodItem;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: FoodItem, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Calculate total items
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Calculate total price
  const totalPrice = cart.reduce(
    (total, { item, quantity }) => total + item.price * quantity,
    0
  );

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('dimzia-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dimzia-cart', JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (item: FoodItem, quantity: number) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        cartItem => cartItem.item.id === item.id
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        // Add new item to cart
        return [...prevCart, { item, quantity }];
      }
    });

    toast({
      title: 'Added to cart',
      description: `${quantity} × ${item.name} added to your cart`,
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.item.id !== itemId));
  };

  // Update quantity of an item
  const updateQuantity = (itemId: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(cartItem =>
        cartItem.item.id === itemId
          ? { ...cartItem, quantity }
          : cartItem
      ).filter(item => item.quantity > 0) // Remove items with quantity 0
    );
  };

  // Clear the cart
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
