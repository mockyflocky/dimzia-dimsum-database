
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  AlertTriangle, 
  Image as ImageIcon,
  MapPin 
} from 'lucide-react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getCollection, setDocument, deleteDocument, menuItemsRef, deliveryZonesRef } from '@/integrations/firebase/client';

// Define types for menu items and delivery zones
interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  is_popular: boolean | null;
  created_at: string;
  updated_at: string;
}

interface DeliveryZone {
  id: string;
  zone_name: string;
  base_price: number;
  created_at: string;
}

// Main admin component
const Admin = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('menu');
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/auth');
      toast({
        title: "Unauthorized",
        description: "You must be an admin to access this page.",
        variant: "destructive",
      });
    }
  }, [user, isAdmin, isLoading, navigate, toast]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-dimzia-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!user || !isAdmin) {
    return null; // Will redirect due to useEffect
  }
  
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-serif text-3xl font-bold text-gray-900 mb-6"
        >
          Admin Dashboard
        </motion.h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="delivery">Delivery Zones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="menu">
            <MenuManagement />
          </TabsContent>
          
          <TabsContent value="delivery">
            <DeliveryManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Menu Management Component
const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<Partial<MenuItem>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Load menu items from Firebase
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const data = await getCollection('menu_items', 'category', 'asc');
        setMenuItems(data as MenuItem[]);
      } catch (error: any) {
        console.error('Error fetching menu items:', error.message);
        toast({
          title: "Error",
          description: "Failed to load menu items.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuItems();
  }, [toast]);
  
  // Save or update menu item
  const handleSave = async () => {
    try {
      // Validate required fields
      if (!editItem.name || !editItem.price || !editItem.category) {
        toast({
          title: "Validation Error",
          description: "Name, price, and category are required.",
          variant: "destructive",
        });
        return;
      }
      
      const item = {
        name: editItem.name,
        description: editItem.description || null,
        price: Number(editItem.price),
        image_url: editItem.image_url || null,
        category: editItem.category,
        is_popular: editItem.is_popular || false,
        updated_at: new Date().toISOString()
      };
      
      if (isEditing && editItem.id) {
        // Update existing item
        await setDocument('menu_items', editItem.id, item);
        
        // Update local state
        setMenuItems(prev => 
          prev.map(i => i.id === editItem.id ? { ...i, ...item } as MenuItem : i)
        );
        
        toast({
          title: "Success",
          description: "Menu item updated successfully.",
        });
      } else {
        // Create new item with additional fields for new items
        const newItem = {
          ...item,
          created_at: new Date().toISOString()
        };
        
        // Generate a unique ID
        const uniqueId = Date.now().toString();
        await setDocument('menu_items', uniqueId, newItem);
        
        // Update local state
        const createdItem = {
          id: uniqueId,
          ...newItem
        } as MenuItem;
        
        setMenuItems(prev => [...prev, createdItem]);
        
        toast({
          title: "Success",
          description: "Menu item created successfully.",
        });
      }
      
      // Close dialog and reset form
      setDialogOpen(false);
      setEditItem({});
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving menu item:', error.message);
      toast({
        title: "Error",
        description: "Failed to save menu item.",
        variant: "destructive",
      });
    }
  };
  
  // Delete menu item
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      await deleteDocument('menu_items', id);
      
      // Update local state
      setMenuItems(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Success",
        description: "Menu item deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting menu item:', error.message);
      toast({
        title: "Error",
        description: "Failed to delete menu item.",
        variant: "destructive",
      });
    }
  };
  
  // Add new item
  const handleAddNew = () => {
    setEditItem({
      name: '',
      description: '',
      price: 0,
      image_url: '',
      category: '',
      is_popular: false
    });
    setIsEditing(false);
    setDialogOpen(true);
  };
  
  // Edit existing item
  const handleEdit = (item: MenuItem) => {
    setEditItem({ ...item });
    setIsEditing(true);
    setDialogOpen(true);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin h-8 w-8 border-4 border-dimzia-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Group menu items by category
  const menuByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-semibold">Menu Items</h2>
        <Button 
          onClick={handleAddNew}
          className="bg-dimzia-primary hover:bg-dimzia-primary/90"
        >
          <Plus size={16} className="mr-2" /> Add New Item
        </Button>
      </div>
      
      {Object.entries(menuByCategory).length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-2" />
          <p className="text-gray-600">No menu items found. Add your first item to get started.</p>
        </div>
      ) : (
        Object.entries(menuByCategory).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h3 className="text-xl font-semibold mb-4 font-serif">{category}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Popular</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>Rp {(item.price * 15000).toLocaleString('id-ID')}</TableCell>
                    <TableCell>{item.is_popular ? '✓' : '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(item)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={editItem.name || ''} 
                onChange={e => setEditItem({...editItem, name: e.target.value})}
                placeholder="Item name"
              />
            </div>
            
            <div className="grid gap-4">
              <Label htmlFor="category">Category</Label>
              <Input 
                id="category" 
                value={editItem.category || ''} 
                onChange={e => setEditItem({...editItem, category: e.target.value})}
                placeholder="e.g., Dimsum, Drinks, etc."
              />
            </div>
            
            <div className="grid gap-4">
              <Label htmlFor="price">Price</Label>
              <Input 
                id="price" 
                type="number" 
                step="0.01"
                value={editItem.price || ''} 
                onChange={e => setEditItem({...editItem, price: parseFloat(e.target.value)})}
                placeholder="Price in USD"
              />
              <p className="text-sm text-gray-500">Note: Price will be displayed as Rp {editItem.price ? (parseFloat(editItem.price.toString()) * 15000).toLocaleString('id-ID') : '0'}</p>
            </div>
            
            <div className="grid gap-4">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={editItem.description || ''} 
                onChange={e => setEditItem({...editItem, description: e.target.value})}
                placeholder="Item description"
              />
            </div>
            
            <div className="grid gap-4">
              <Label htmlFor="image_url">Image URL</Label>
              <Input 
                id="image_url" 
                value={editItem.image_url || ''} 
                onChange={e => setEditItem({...editItem, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_popular"
                checked={!!editItem.is_popular}
                onChange={e => setEditItem({...editItem, is_popular: e.target.checked})}
                className="h-4 w-4 rounded border-gray-300 text-dimzia-primary focus:ring-dimzia-primary"
              />
              <Label htmlFor="is_popular">Popular Item</Label>
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2 sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
            >
              <X size={16} className="mr-2" /> Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-dimzia-primary hover:bg-dimzia-primary/90"
            >
              <Save size={16} className="mr-2" /> {isEditing ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Delivery Management Component
const DeliveryManagement = () => {
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editZone, setEditZone] = useState<Partial<DeliveryZone>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Load delivery zones from Firebase
  useEffect(() => {
    const fetchDeliveryZones = async () => {
      try {
        const data = await getCollection('delivery_zones', 'base_price', 'asc');
        setDeliveryZones(data as DeliveryZone[]);
      } catch (error: any) {
        console.error('Error fetching delivery zones:', error.message);
        toast({
          title: "Error",
          description: "Failed to load delivery zones.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeliveryZones();
  }, [toast]);
  
  // Save or update delivery zone
  const handleSave = async () => {
    try {
      // Validate required fields
      if (!editZone.zone_name || editZone.base_price === undefined) {
        toast({
          title: "Validation Error",
          description: "Zone name and price are required.",
          variant: "destructive",
        });
        return;
      }
      
      const zone = {
        zone_name: editZone.zone_name,
        base_price: Number(editZone.base_price)
      };
      
      if (isEditing && editZone.id) {
        // Update existing zone
        await setDocument('delivery_zones', editZone.id, zone);
        
        // Update local state
        setDeliveryZones(prev => 
          prev.map(z => z.id === editZone.id ? { ...z, ...zone } as DeliveryZone : z)
        );
        
        toast({
          title: "Success",
          description: "Delivery zone updated successfully.",
        });
      } else {
        // Create new zone with additional fields for new items
        const newZone = {
          ...zone,
          created_at: new Date().toISOString()
        };
        
        // Generate a unique ID
        const uniqueId = Date.now().toString();
        await setDocument('delivery_zones', uniqueId, newZone);
        
        // Update local state
        const createdZone = {
          id: uniqueId,
          ...newZone
        } as DeliveryZone;
        
        setDeliveryZones(prev => [...prev, createdZone]);
        
        toast({
          title: "Success",
          description: "Delivery zone created successfully.",
        });
      }
      
      // Close dialog and reset form
      setDialogOpen(false);
      setEditZone({});
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving delivery zone:', error.message);
      toast({
        title: "Error",
        description: "Failed to save delivery zone.",
        variant: "destructive",
      });
    }
  };
  
  // Delete delivery zone
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this zone?")) return;
    
    try {
      await deleteDocument('delivery_zones', id);
      
      // Update local state
      setDeliveryZones(prev => prev.filter(zone => zone.id !== id));
      
      toast({
        title: "Success",
        description: "Delivery zone deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting delivery zone:', error.message);
      toast({
        title: "Error",
        description: "Failed to delete delivery zone.",
        variant: "destructive",
      });
    }
  };
  
  // Add new zone
  const handleAddNew = () => {
    setEditZone({
      zone_name: '',
      base_price: 0
    });
    setIsEditing(false);
    setDialogOpen(true);
  };
  
  // Edit existing zone
  const handleEdit = (zone: DeliveryZone) => {
    setEditZone({ ...zone });
    setIsEditing(true);
    setDialogOpen(true);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin h-8 w-8 border-4 border-dimzia-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-semibold">Delivery Zones</h2>
        <Button 
          onClick={handleAddNew}
          className="bg-dimzia-primary hover:bg-dimzia-primary/90"
        >
          <Plus size={16} className="mr-2" /> Add New Zone
        </Button>
      </div>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2">
        <MapPin className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-sm text-blue-700">Store starting coordinates for delivery distance calculation:</p>
          <p className="text-sm font-mono mt-1">-2.2612092256138, 113.92016284747595</p>
        </div>
      </div>
      
      {deliveryZones.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-2" />
          <p className="text-gray-600">No delivery zones found. Add your first zone to get started.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zone Name</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveryZones.map(zone => (
              <TableRow key={zone.id}>
                <TableCell className="font-medium">{zone.zone_name}</TableCell>
                <TableCell>Rp {zone.base_price.toLocaleString('id-ID')}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEdit(zone)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(zone.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Delivery Zone' : 'Add New Delivery Zone'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <Label htmlFor="zone_name">Zone Name</Label>
              <Input 
                id="zone_name" 
                value={editZone.zone_name || ''} 
                onChange={e => setEditZone({...editZone, zone_name: e.target.value})}
                placeholder="e.g., Zone 1 (0-3 km)"
              />
            </div>
            
            <div className="grid gap-4">
              <Label htmlFor="base_price">Base Price</Label>
              <Input 
                id="base_price" 
                type="number" 
                value={editZone.base_price || ''} 
                onChange={e => setEditZone({...editZone, base_price: parseFloat(e.target.value)})}
                placeholder="Price in IDR"
              />
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2 sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
            >
              <X size={16} className="mr-2" /> Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-dimzia-primary hover:bg-dimzia-primary/90"
            >
              <Save size={16} className="mr-2" /> {isEditing ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
