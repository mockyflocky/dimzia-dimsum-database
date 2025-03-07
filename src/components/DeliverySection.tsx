
import React, { useState } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AnimatedText from '@/components/AnimatedText';

// Store coordinates (starting point)
const STORE_COORDINATES = {
  latitude: -2.2612092256138,
  longitude: 113.92016284747595
};

// Cost per kilometer (in IDR)
const COST_PER_KM = 3000;

interface DeliverySectionProps {
  deliveryCost: number;
  setDeliveryCost: (cost: number) => void;
  address: string;
  setAddress: (address: string) => void;
}

const DeliverySection: React.FC<DeliverySectionProps> = ({
  deliveryCost,
  setDeliveryCost,
  address,
  setAddress
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [coordinates, setCoordinates] = useState<{latitude: number | null, longitude: number | null}>({
    latitude: null,
    longitude: null
  });
  const [distance, setDistance] = useState<number | null>(null);

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

  // Get user's location if they agree
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          
          // Calculate distance
          const calculatedDistance = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            STORE_COORDINATES.latitude,
            STORE_COORDINATES.longitude
          );
          
          setDistance(calculatedDistance);
          setDeliveryCost(Math.ceil(calculatedDistance) * COST_PER_KM);
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  return (
    <>
      <div className="p-3 bg-blue-50 rounded-md border border-blue-100 flex items-start gap-2">
        <MapPin className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-sm text-blue-700 font-medium">Share your location for delivery estimation</p>
          <p className="text-xs text-blue-600 mt-1 mb-2">We'll calculate the delivery cost based on your distance (Rp {COST_PER_KM.toLocaleString('id-ID')} per km)</p>
          <Button 
            onClick={getUserLocation}
            disabled={isLocating}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-full transition-colors"
            size="sm"
          >
            {isLocating ? (
              <>
                <Loader size={14} className="animate-spin mr-1" /> 
                Getting Location...
              </>
            ) : (
              'Get My Location'
            )}
          </Button>
          
          {coordinates.latitude && coordinates.longitude && !isLocating && (
            <div className="mt-3 p-2 bg-white rounded-md border border-blue-200">
              <p className="text-base font-bold text-blue-800">
                Location detected!
              </p>
              <p className="font-bold text-dimzia-primary text-lg">
                Distance: {distance?.toFixed(2)} km
              </p>
              <p className="font-bold text-dimzia-dark text-lg">
                Delivery: Rp {deliveryCost.toLocaleString('id-ID')}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="address" className="block mb-1 font-medium text-gray-700">Alamat:</label>
        <Textarea
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full"
          rows={3}
          required
        />
      </div>
    </>
  );
};

export default DeliverySection;
