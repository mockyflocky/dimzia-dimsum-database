
export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'steamed' | 'fried' | 'baked' | 'dessert' | 'special';
  isPopular: boolean;
}

export const foodItems: FoodItem[] = [
  {
    id: '1',
    name: 'Har Gow',
    description: 'Translucent shrimp dumplings wrapped in a delicate rice flour skin',
    price: 6.50,
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=500',
    category: 'steamed',
    isPopular: true
  },
  {
    id: '2',
    name: 'Siu Mai',
    description: 'Open-topped pork and shrimp dumplings with thin yellow wrapper',
    price: 5.80,
    imageUrl: 'https://images.unsplash.com/photo-1625398407796-82290d602e26?auto=format&fit=crop&q=80&w=500',
    category: 'steamed',
    isPopular: true
  },
  {
    id: '3',
    name: 'BBQ Pork Buns',
    description: 'Fluffy steamed buns filled with sweet and savory char siu pork',
    price: 5.50,
    imageUrl: 'https://images.unsplash.com/photo-1499889808931-317a0255752b?auto=format&fit=crop&q=80&w=500',
    category: 'steamed',
    isPopular: true
  },
  {
    id: '4',
    name: 'Spring Rolls',
    description: 'Crispy fried rolls with mixed vegetables and shrimp filling',
    price: 4.80,
    imageUrl: 'https://images.unsplash.com/photo-1548811256-1296d91ead41?auto=format&fit=crop&q=80&w=500',
    category: 'fried',
    isPopular: false
  },
  {
    id: '5',
    name: 'Rice Noodle Rolls',
    description: 'Delicate rice noodle sheets filled with shrimp, beef, or vegetables',
    price: 6.20,
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=500',
    category: 'steamed',
    isPopular: false
  },
  {
    id: '6',
    name: 'Egg Tarts',
    description: 'Sweet and creamy custard in a flaky pastry shell',
    price: 3.90,
    imageUrl: 'https://images.unsplash.com/photo-1624372618117-596b5a127a1f?auto=format&fit=crop&q=80&w=500',
    category: 'dessert',
    isPopular: true
  },
  {
    id: '7',
    name: 'Turnip Cake',
    description: 'Pan-fried shredded turnip cakes with dried shrimp and Chinese sausage',
    price: 5.20,
    imageUrl: 'https://images.unsplash.com/photo-1601234699404-6170bd52adf8?auto=format&fit=crop&q=80&w=500',
    category: 'fried',
    isPopular: false
  },
  {
    id: '8',
    name: 'Custard Buns',
    description: 'Steamed buns with rich, flowing salted egg custard center',
    price: 5.50,
    imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&q=80&w=500',
    category: 'steamed',
    isPopular: true
  },
  {
    id: '9',
    name: 'Pineapple Buns',
    description: 'Sweet buns with a crumbly, pineapple-patterned top crust',
    price: 4.50,
    imageUrl: 'https://images.unsplash.com/photo-1506224772180-d75b3efbe9be?auto=format&fit=crop&q=80&w=500',
    category: 'baked',
    isPopular: false
  },
  {
    id: '10',
    name: 'Dimzia Special',
    description: 'Chef\'s special dumpling platter with our signature dipping sauce',
    price: 12.90,
    imageUrl: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&q=80&w=500',
    category: 'special',
    isPopular: true
  },
];

export const getPopularItems = (): FoodItem[] => {
  return foodItems.filter(item => item.isPopular);
};

export const getItemsByCategory = (category: FoodItem['category']): FoodItem[] => {
  return foodItems.filter(item => item.category === category);
};

export const searchItems = (query: string): FoodItem[] => {
  const lowercaseQuery = query.toLowerCase();
  return foodItems.filter(
    item => 
      item.name.toLowerCase().includes(lowercaseQuery) || 
      item.description.toLowerCase().includes(lowercaseQuery)
  );
};

export const categories = [
  { id: 'all', name: 'All' },
  { id: 'steamed', name: 'Steamed' },
  { id: 'fried', name: 'Fried' },
  { id: 'baked', name: 'Baked' },
  { id: 'dessert', name: 'Dessert' },
  { id: 'special', name: 'Special' }
];
