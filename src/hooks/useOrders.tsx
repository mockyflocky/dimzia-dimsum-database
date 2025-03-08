
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CustomerOrder } from '@/lib/models';
import { useToast } from './use-toast';
import { nanoid } from 'nanoid';

interface OrdersContextType {
  orders: CustomerOrder[];
  isLoading: boolean;
  saveOrder: (order: Omit<CustomerOrder, 'id' | 'orderNumber' | 'orderDate'>) => Promise<{success: boolean, orderNumber: number}>;
  getNextOrderNumber: () => Promise<number>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('customer_orders')
        .select('*')
        .order('orderNumber', { ascending: false });

      if (error) {
        throw error;
      }

      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error.message);
      toast({
        title: 'Error loading orders',
        description: error.message || 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNextOrderNumber = async (): Promise<number> => {
    try {
      // Get the highest order number
      const { data, error } = await supabase
        .from('customer_orders')
        .select('orderNumber')
        .order('orderNumber', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      return data && data.length > 0 ? data[0].orderNumber + 1 : 1;
    } catch (error: any) {
      console.error('Error getting next order number:', error.message);
      return orders.length > 0 
        ? Math.max(...orders.map(o => o.orderNumber)) + 1 
        : 1;
    }
  };

  const saveOrder = async (order: Omit<CustomerOrder, 'id' | 'orderNumber' | 'orderDate'>) => {
    try {
      const orderNumber = await getNextOrderNumber();
      
      const newOrder: CustomerOrder = {
        ...order,
        id: nanoid(),
        orderNumber,
        orderDate: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('customer_orders')
        .insert([newOrder]);

      if (error) {
        throw error;
      }

      setOrders([newOrder, ...orders]);
      
      toast({
        title: 'Order Saved',
        description: `Order #${orderNumber} has been recorded`,
      });
      
      return { success: true, orderNumber };
    } catch (error: any) {
      console.error('Error saving order:', error.message);
      toast({
        title: 'Error saving order',
        description: error.message || 'Failed to save order',
        variant: 'destructive',
      });
      return { success: false, orderNumber: 0 };
    }
  };

  return (
    <OrdersContext.Provider value={{
      orders,
      isLoading,
      saveOrder,
      getNextOrderNumber,
    }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  
  return context;
};
