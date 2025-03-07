
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { ArrowLeft, Plus, Minus, Trash2, Send, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

enum DeliveryMethod {
  PICKUP = 'Ambil Sendiri',
  DELIVERY = 'Delivery (20 min+)'
}

interface DeliveryZone {
  id: string;
  zone_name: string;
  base_price: number;
}

// Store coordinates (starting point)
const STORE_COORDINATES = {
  latitude: -2.2612092256138,
  longitude: 113.92016284747595
};

const Checkout = () => {
  const { cart, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.PICKUP);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [deliveryCost, setDeliveryCost] = useState<number>(0);
  const [coordinates, setCoordinates] = useState<{latitude: number | null, longitude: number | null}>({
    latitude: null,
    longitude: null
  });

  useEffect(() => {
    const fetchDeliveryZones = async () => {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .order('base_price', { ascending: true });
      
      if (error) {
        console.error('Error fetching delivery zones:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setDeliveryZones(data);
        setSelectedZone(data[0].id);
        setDeliveryCost(data[0].base_price);
      }
    };
    
    fetchDeliveryZones();
  }, []);

  useEffect(() => {
    if (deliveryMethod === DeliveryMethod.PICKUP) {
      setDeliveryCost(0);
    } else if (deliveryMethod === DeliveryMethod.DELIVERY && selectedZone) {
      const zone = deliveryZones.find(zone => zone.id === selectedZone);
      if (zone) {
        setDeliveryCost(zone.base_price);
      }
    }
  }, [deliveryMethod, selectedZone, deliveryZones]);

  // Get user's location if they agree
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          
          // Calculate distance and set appropriate zone
          const distance = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            STORE_COORDINATES.latitude,
            STORE_COORDINATES.longitude
          );
          
          // Find the appropriate zone based on distance
          const appropriateZone = getZoneFromDistance(distance);
          if (appropriateZone) {
            setSelectedZone(appropriateZone.id);
            setDeliveryCost(appropriateZone.base_price);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  };

  // Convert degrees to radians
  const toRad = (value: number) => {
    return value * Math.PI / 180;
  };

  // Get the appropriate zone based on distance
  const getZoneFromDistance = (distance: number) => {
    // Simple logic to determine zone based on distance
    if (distance <= 3) {
      return deliveryZones.find(zone => zone.zone_name.includes("Zone 1"));
    } else if (distance <= 5) {
      return deliveryZones.find(zone => zone.zone_name.includes("Zone 2"));
    } else if (distance <= 7) {
      return deliveryZones.find(zone => zone.zone_name.includes("Zone 3"));
    } else {
      // If distance is greater than 7km, return the most expensive zone
      return deliveryZones.sort((a, b) => b.base_price - a.base_price)[0];
    }
  };

  const handleSendOrder = () => {
    if (!name) {
      alert('Please enter your name');
      return;
    }
    
    if (deliveryMethod === DeliveryMethod.DELIVERY && !address) {
      alert('Please enter your address for delivery');
      return;
    }

    // Format the order message for WhatsApp
    const orderItems = cart.map(
      ({ item, quantity }) => `${quantity}x ${item.name} (Rp ${(item.price * 15000 * quantity).toLocaleString('id-ID')})`
    ).join('\n');
    
    const message = `
*New Order from Dimzia Dimsum*
-----------------------------
*Name:* ${name}
*Delivery Method:* ${deliveryMethod}
${deliveryMethod === DeliveryMethod.DELIVERY ? 
  `*Address:* ${address}\n*Delivery Zone:* ${deliveryZones.find(zone => zone.id === selectedZone)?.zone_name}\n*Delivery Cost:* Rp ${deliveryCost.toLocaleString('id-ID')}\n` : ''}
*Order Details:*
${orderItems}
-----------------------------
*Total Items:* ${totalItems}
*Subtotal:* Rp ${(totalPrice * 15000).toLocaleString('id-ID')}
${deliveryMethod === DeliveryMethod.DELIVERY ? `*Delivery Cost:* Rp ${deliveryCost.toLocaleString('id-ID')}\n*Grand Total:* Rp ${(totalPrice * 15000 + deliveryCost).toLocaleString('id-ID')}` : ''}
    `;
    
    // Create WhatsApp link (you'll replace the phone number)
    const phoneNumber = '6281234567890'; // Replace with your actual WhatsApp number
    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappLink, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex flex-col items-center justify-center">
        <div className="text-center p-8 max-w-xl">
          <h1 className="font-serif text-2xl font-semibold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link to="/catalog">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-dimzia-primary text-white rounded-full font-medium"
            >
              Browse Menu
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-4">
          <Link to="/catalog" className="inline-flex items-center text-dimzia-primary hover:underline">
            <ArrowLeft size={16} className="mr-1" />
            Back to Catalog
          </Link>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-serif text-3xl font-bold text-gray-900 mb-6"
        >
          Checkout
        </motion.h1>

        {/* Order items */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="font-serif text-xl font-semibold mb-4">Your Order</h2>
          
          <div className="divide-y divide-gray-200">
            {cart.map(({ item, quantity }) => (
              <div key={item.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-16 h-16 object-cover rounded mr-4" 
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-dimzia-primary">Rp {(item.price * 15000).toLocaleString('id-ID')}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex items-center border border-gray-200 rounded-full overflow-hidden mr-2">
                    <button
                      onClick={() => updateQuantity(item.id, quantity - 1)}
                      className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                    >
                      <Minus size={14} />
                    </button>
                    
                    <span className="px-2 min-w-[30px] text-center">
                      {quantity}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(item.id, quantity + 1)}
                      className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between pt-4 border-t border-gray-200 font-semibold text-lg">
            <span>Subtotal:</span>
            <span>Rp {(totalPrice * 15000).toLocaleString('id-ID')}</span>
          </div>
          
          {deliveryMethod === DeliveryMethod.DELIVERY && (
            <div className="flex justify-between pt-2 text-lg">
              <span>Delivery:</span>
              <span>Rp {deliveryCost.toLocaleString('id-ID')}</span>
            </div>
          )}
          
          {deliveryMethod === DeliveryMethod.DELIVERY && (
            <div className="flex justify-between pt-2 font-bold text-lg text-dimzia-primary">
              <span>Total:</span>
              <span>Rp {(totalPrice * 15000 + deliveryCost).toLocaleString('id-ID')}</span>
            </div>
          )}
        </div>

        {/* Customer information */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="font-serif text-xl font-semibold mb-4">Your Information</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1 font-medium text-gray-700">Nama:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-dimzia-primary focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="delivery" className="block mb-1 font-medium text-gray-700">Metode Pengambilan:</label>
              <select
                id="delivery"
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-dimzia-primary focus:border-transparent"
              >
                <option value={DeliveryMethod.PICKUP}>{DeliveryMethod.PICKUP}</option>
                <option value={DeliveryMethod.DELIVERY}>{DeliveryMethod.DELIVERY}</option>
              </select>
            </div>
            
            {deliveryMethod === DeliveryMethod.DELIVERY && (
              <>
                <div className="p-3 bg-blue-50 rounded-md border border-blue-100 flex items-start gap-2">
                  <MapPin className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Share your location for delivery estimation</p>
                    <p className="text-xs text-blue-600 mt-1 mb-2">We'll calculate the delivery zone based on your distance from our store</p>
                    <button 
                      onClick={getUserLocation}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-full transition-colors"
                    >
                      Get My Location
                    </button>
                    {coordinates.latitude && coordinates.longitude && (
                      <p className="text-xs text-blue-600 mt-2">
                        Location detected! Zone updated accordingly.
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="zone" className="block mb-1 font-medium text-gray-700">Zone Pengiriman:</label>
                  <select
                    id="zone"
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-dimzia-primary focus:border-transparent"
                  >
                    {deliveryZones.map(zone => (
                      <option key={zone.id} value={zone.id}>
                        {zone.zone_name} - Rp {zone.base_price.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="address" className="block mb-1 font-medium text-gray-700">Alamat:</label>
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-dimzia-primary focus:border-transparent"
                    rows={3}
                    required
                  ></textarea>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Send order button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSendOrder}
          className="w-full flex items-center justify-center gap-2 bg-dimzia-primary text-white py-3 px-6 rounded-md font-semibold text-lg"
        >
          <Send size={20} />
          Send Order via WhatsApp
        </motion.button>
      </div>
    </div>
  );
};

export default Checkout;
