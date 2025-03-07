
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Save, X } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_popular: boolean;
}

interface DeliveryZone {
  id: string;
  zone_name: string;
  base_price: number;
}

const Admin = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [activeTab, setActiveTab] = useState<'menu' | 'delivery'>('menu');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    category: 'steamed',
    is_popular: false
  });
  
  const [zoneForm, setZoneForm] = useState<Partial<DeliveryZone>>({
    zone_name: '',
    base_price: 0
  });

  // If not logged in or not admin, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex flex-col items-center justify-center">
        <div className="text-center p-8 max-w-xl">
          <h1 className="font-serif text-2xl font-semibold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You do not have admin permissions to access this page.</p>
          <button
            onClick={() => signOut()}
            className="px-6 py-3 bg-dimzia-primary text-white rounded-full font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .order('name');
        
        if (menuError) throw menuError;
        setMenuItems(menuData || []);
        
        // Fetch delivery zones
        const { data: zoneData, error: zoneError } = await supabase
          .from('delivery_zones')
          .select('*')
          .order('base_price');
        
        if (zoneError) throw zoneError;
        setDeliveryZones(zoneData || []);
      } catch (error: any) {
        toast({
          title: 'Error loading data',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else if (name === 'price') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleZoneInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'base_price') {
      setZoneForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setZoneForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddItem = async () => {
    try {
      if (!formData.name || !formData.description || formData.price <= 0 || !formData.image_url || !formData.category) {
        toast({
          title: 'Missing fields',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('menu_items')
        .insert([formData])
        .select()
        .single();
      
      if (error) throw error;
      
      setMenuItems(prev => [...prev, data]);
      setIsAdding(false);
      setFormData({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        category: 'steamed',
        is_popular: false
      });
      
      toast({
        title: 'Menu item added successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error adding menu item',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update(formData)
        .eq('id', id);
      
      if (error) throw error;
      
      setMenuItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...formData } as MenuItem : item
      ));
      
      setIsEditing(null);
      toast({
        title: 'Menu item updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating menu item',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setMenuItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Menu item deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting menu item',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const startEditing = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image_url,
      category: item.category,
      is_popular: item.is_popular
    });
    setIsEditing(item.id);
  };

  const handleAddZone = async () => {
    try {
      if (!zoneForm.zone_name || zoneForm.base_price <= 0) {
        toast({
          title: 'Missing fields',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('delivery_zones')
        .insert([zoneForm])
        .select()
        .single();
      
      if (error) throw error;
      
      setDeliveryZones(prev => [...prev, data]);
      setZoneForm({
        zone_name: '',
        base_price: 0
      });
      
      toast({
        title: 'Delivery zone added successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error adding delivery zone',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteZone = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery zone?')) return;
    
    try {
      const { error } = await supabase
        .from('delivery_zones')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setDeliveryZones(prev => prev.filter(zone => zone.id !== id));
      toast({
        title: 'Delivery zone deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting delivery zone',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-serif text-3xl font-bold text-gray-900"
          >
            Admin Dashboard
          </motion.h1>
          
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Sign Out
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 font-medium ${activeTab === 'menu' ? 'text-dimzia-primary border-b-2 border-dimzia-primary' : 'text-gray-600'}`}
          >
            Menu Items
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`px-4 py-2 font-medium ${activeTab === 'delivery' ? 'text-dimzia-primary border-b-2 border-dimzia-primary' : 'text-gray-600'}`}
          >
            Delivery Zones
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dimzia-primary"></div>
          </div>
        ) : (
          <>
            {activeTab === 'menu' && (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Menu Items</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-1 px-3 py-2 bg-dimzia-primary text-white rounded-md hover:bg-dimzia-dark transition-colors"
                    disabled={isAdding}
                  >
                    <PlusCircle size={16} />
                    Add Item
                  </motion.button>
                </div>
                
                {isAdding && (
                  <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <h3 className="font-medium text-lg mb-4">Add New Menu Item</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-dimzia-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (in thousands IDR)</label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-dimzia-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-dimzia-primary"
                        >
                          <option value="steamed">Steamed</option>
                          <option value="fried">Fried</option>
                          <option value="baked">Baked</option>
                          <option value="dessert">Dessert</option>
                          <option value="special">Special</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <input
                          type="text"
                          name="image_url"
                          value={formData.image_url}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-dimzia-primary"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-dimzia-primary"
                        ></textarea>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_popular"
                          name="is_popular"
                          checked={formData.is_popular}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_popular: e.target.checked }))}
                          className="h-4 w-4 text-dimzia-primary focus:ring-dimzia-primary border-gray-300 rounded"
                        />
                        <label htmlFor="is_popular" className="ml-2 block text-sm text-gray-900">
                          Popular Item
                        </label>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setIsAdding(false);
                          setFormData({
                            name: '',
                            description: '',
                            price: 0,
                            image_url: '',
                            category: 'steamed',
                            is_popular: false
                          });
                        }}
                        className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddItem}
                        className="px-3 py-1 bg-dimzia-primary text-white rounded-md hover:bg-dimzia-dark"
                      >
                        Add Item
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Popular</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {menuItems.map(item => (
                        <tr key={item.id}>
                          {isEditing === item.id ? (
                            <>
                              <td className="px-6 py-4 space-y-2">
                                <input
                                  type="text"
                                  name="name"
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                  placeholder="Name"
                                />
                                <textarea
                                  name="description"
                                  value={formData.description}
                                  onChange={handleInputChange}
                                  rows={2}
                                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                  placeholder="Description"
                                ></textarea>
                                <input
                                  type="text"
                                  name="image_url"
                                  value={formData.image_url}
                                  onChange={handleInputChange}
                                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                  placeholder="Image URL"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="number"
                                  name="price"
                                  value={formData.price}
                                  onChange={handleInputChange}
                                  step="0.01"
                                  className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  name="category"
                                  value={formData.category}
                                  onChange={handleInputChange}
                                  className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                                >
                                  <option value="steamed">Steamed</option>
                                  <option value="fried">Fried</option>
                                  <option value="baked">Baked</option>
                                  <option value="dessert">Dessert</option>
                                  <option value="special">Special</option>
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  name="is_popular"
                                  checked={formData.is_popular}
                                  onChange={(e) => setFormData(prev => ({ ...prev, is_popular: e.target.checked }))}
                                  className="h-4 w-4 text-dimzia-primary focus:ring-dimzia-primary border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end space-x-2">
                                  <button 
                                    onClick={() => handleSaveItem(item.id)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <Save size={18} />
                                  </button>
                                  <button 
                                    onClick={() => setIsEditing(null)}
                                    className="text-gray-600 hover:text-gray-900"
                                  >
                                    <X size={18} />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <img className="h-10 w-10 rounded-full object-cover mr-3" src={item.image_url} alt={item.name} />
                                  <div>
                                    <div className="font-medium text-gray-900">{item.name}</div>
                                    <div className="text-sm text-gray-500 line-clamp-2">{item.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">Rp {(item.price * 15000).toLocaleString('id-ID')}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  item.category === 'steamed' ? 'bg-blue-100 text-blue-800' :
                                  item.category === 'fried' ? 'bg-orange-100 text-orange-800' :
                                  item.category === 'baked' ? 'bg-yellow-100 text-yellow-800' :
                                  item.category === 'dessert' ? 'bg-pink-100 text-pink-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {item.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {item.is_popular ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Yes
                                  </span>
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                    No
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button onClick={() => startEditing(item)} className="text-blue-600 hover:text-blue-900">
                                    <Edit size={18} />
                                  </button>
                                  <button onClick={() => handleDeleteItem(item.id)} className="text-red-600 hover:text-red-900">
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                      {menuItems.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            No menu items found. Add some items to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'delivery' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-4">Delivery Zones</h2>
                  
                  <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <h3 className="font-medium mb-3">Add New Delivery Zone</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
                        <input
                          type="text"
                          name="zone_name"
                          value={zoneForm.zone_name}
                          onChange={handleZoneInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-dimzia-primary"
                          placeholder="e.g. Zone 1 (0-3 km)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (IDR)</label>
                        <input
                          type="number"
                          name="base_price"
                          value={zoneForm.base_price}
                          onChange={handleZoneInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-dimzia-primary"
                          placeholder="e.g. 15000"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={handleAddZone}
                        className="px-4 py-2 bg-dimzia-primary text-white rounded-md hover:bg-dimzia-dark transition-colors"
                      >
                        Add Zone
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {deliveryZones.map(zone => (
                          <tr key={zone.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{zone.zone_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">Rp {zone.base_price.toLocaleString('id-ID')}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button onClick={() => handleDeleteZone(zone.id)} className="text-red-600 hover:text-red-900">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {deliveryZones.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                              No delivery zones found. Add some zones to get started.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
