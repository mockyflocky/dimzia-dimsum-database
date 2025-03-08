
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
        .order('ordernumber', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const mappedOrders: CustomerOrder[] = data.map(order => ({
          id: order.id,
          orderNumber: order.ordernumber,
          customerName: order.customername,
          deliveryMethod: order.deliverymethod,
          address: order.address || undefined,
          distance: order.distance || undefined,
          deliveryCost: order.deliverycost || undefined,
          items: order.items as any,
          totalItems: order.totalitems,
          subtotal: order.subtotal,
          orderDate: order.orderdate
        }));
        setOrders(mappedOrders);
      }
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
        .select('ordernumber')
        .order('ordernumber', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      return data && data.length > 0 ? data[0].ordernumber + 1 : 1;
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

      // Map the model fields to database column names
      const dbOrder = {
        id: newOrder.id,
        ordernumber: newOrder.orderNumber,
        customername: newOrder.customerName,
        deliverymethod: newOrder.deliveryMethod,
        address: newOrder.address,
        distance: newOrder.distance,
        deliverycost: newOrder.deliveryCost,
        items: newOrder.items,
        totalitems: newOrder.totalItems,
        subtotal: newOrder.subtotal,
        orderdate: newOrder.orderDate
      };

      const { error } = await supabase
        .from('customer_orders')
        .insert([dbOrder]);

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
