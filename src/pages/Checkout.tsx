import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useOrders } from '@/hooks/useOrders';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  address: z.string().min(10, {
    message: "Address must be at least 10 characters.",
  }).optional(),
  deliveryMethod: z.enum(["Pick Up", "Delivery (20 min+)"]),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { toast } = useToast();
  const { saveOrder } = useOrders();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | undefined>(undefined);
  const [deliveryCost, setDeliveryCost] = useState<number | undefined>(undefined);

  // Extract items from cart for easier use
  const items = cart.map(cartItem => ({
    id: cartItem.item.id,
    name: cartItem.item.name,
    quantity: cartItem.quantity,
    price: cartItem.item.price
  }));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      deliveryMethod: "Pick Up",
    },
  });

  const { handleSubmit, reset } = form;

  const resetForm = () => {
    reset({
      name: "",
      address: "",
      deliveryMethod: "Pick Up",
    });
  };

  const calculateDistance = async (address: string) => {
    try {
      const response = await fetch(
        `https://router.hereapi.com/v8/routes?transportMode=car&origin=-2.2612092256138,113.92016284747595&destination=${encodeURIComponent(address)}&return=summary&apiKey=YOUR_API_KEY`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const calculatedDistance = data.routes[0].summary.lengthInMeters / 1000;
      setDistance(calculatedDistance);
      return calculatedDistance;
    } catch (error) {
      console.error("Error calculating distance:", error);
      toast({
        title: "Error",
        description: "Failed to calculate delivery distance.",
        variant: "destructive",
      });
      return undefined;
    }
  };

  const calculateDeliveryCost = async (distance: number) => {
    try {
      const response = await fetch(`/delivery-cost?distance=${distance}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDeliveryCost(data.cost);
      return data.cost;
    } catch (error) {
      console.error("Error calculating delivery cost:", error);
      toast({
        title: "Error",
        description: "Failed to calculate delivery cost.",
        variant: "destructive",
      });
      return undefined;
    }
  };

  const handleCheckout = async (values: z.infer<typeof formSchema>) => {
    try {
      const { name, address, deliveryMethod } = values;
      let calculatedDistance: number | undefined = undefined;
      let calculatedDeliveryCost: number | undefined = undefined;

      if (deliveryMethod === 'Delivery (20 min+)') {
        calculatedDistance = await calculateDistance(address || '');
        if (calculatedDistance !== undefined) {
          calculatedDeliveryCost = await calculateDeliveryCost(calculatedDistance);
        } else {
          toast({
            title: "Error",
            description: "Failed to calculate delivery distance. Please check the address.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Calculate the subtotal of items only (excluding delivery cost)
      const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      
      // Prepare the order data
      const orderData = {
        customerName: name,
        deliveryMethod: deliveryMethod,
        address: deliveryMethod === 'Delivery (20 min+)' ? address : undefined,
        distance: deliveryMethod === 'Delivery (20 min+)' ? distance : undefined,
        deliveryCost: deliveryMethod === 'Delivery (20 min+)' ? deliveryCost : undefined,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price * item.quantity
        })),
        totalItems: items.reduce((acc, item) => acc + item.quantity, 0),
        subtotal: subtotal,
      };
      
      // Save the order to the database
      const { success, orderNumber } = await saveOrder(orderData);
      
      if (success) {
        setOrderNumber(orderNumber);
        setOrderPlaced(true);
        
        // Prepare the WhatsApp message
        const itemsList = items.map(item => 
          `${item.quantity}x ${item.name} - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`
        ).join('\n');
        
        const deliveryInfo = deliveryMethod === 'Delivery (20 min+)' 
          ? `\nAlamat: ${address}\nJarak: ${distance?.toFixed(2)} km\nBiaya Antar: Rp ${deliveryCost?.toLocaleString('id-ID')}` 
          : '';
        
        const message = `*Pesanan #${orderNumber} - ${deliveryMethod}*\nNama: ${name}${deliveryInfo}\n\n*Daftar Pesanan:*\n${itemsList}\n\n*Total: Rp ${subtotal.toLocaleString('id-ID')}*`;
        
        // Create the WhatsApp URL
        const whatsappURL = `https://wa.me/6282245651501?text=${encodeURIComponent(message)}`;
        
        // Open WhatsApp in a new window
        window.open(whatsappURL, '_blank');
        
        // Clear the cart and form
        clearCart();
        resetForm();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "There was a problem processing your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Show confirmation if order was placed
  if (orderPlaced && orderNumber) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-serif font-bold text-gray-900">Order Placed!</h1>
              <p className="text-gray-600 mt-2">Your order #{orderNumber} has been sent to WhatsApp.</p>
            </div>
            
            <div className="text-center mt-8">
              <Button onClick={() => navigate('/catalog')} className="bg-dimzia-primary hover:bg-dimzia-primary/90">
                Return to Catalog
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cart Summary */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Order Summary</h2>
            {items.length === 0 ? (
              <p className="text-gray-600">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle>{item.name}</CardTitle>
                      <CardDescription>Quantity: {item.quantity}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                    </CardContent>
                  </Card>
                ))}
                <div className="font-bold text-xl">
                  Total: Rp {totalPrice.toLocaleString('id-ID')}
                </div>
              </div>
            )}
          </div>

          {/* Checkout Form */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Checkout</h2>
            <Form {...form}>
              <form onSubmit={handleSubmit(handleCheckout)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Delivery Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Pick Up" id="pick_up" />
                            </FormControl>
                            <FormLabel htmlFor="pick_up">Pick Up</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Delivery (20 min+)" id="delivery" />
                            </FormControl>
                            <FormLabel htmlFor="delivery">Delivery (20 min+)</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("deliveryMethod") === "Delivery (20 min+)" && (
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Full Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full bg-dimzia-primary hover:bg-dimzia-primary/90">
                  Place Order
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
