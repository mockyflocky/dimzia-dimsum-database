
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { foodItems, categories, FoodItem as FoodItemType, searchItems, getItemsByCategory } from '@/lib/data';
import FoodItem from '@/components/FoodItem';
import AnimatedText from '@/components/AnimatedText';
import { Search } from 'lucide-react';

const Catalog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<FoodItemType[]>(foodItems);
  
  useEffect(() => {
    let result = foodItems;
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      result = getItemsByCategory(selectedCategory as FoodItemType['category']);
    }
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      result = searchItems(searchQuery);
      // Further filter by category if one is selected
      if (selectedCategory !== 'all') {
        result = result.filter(item => item.category === selectedCategory);
      }
    }
    
    setFilteredItems(result);
  }, [selectedCategory, searchQuery]);
  
  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <section className="bg-gradient-to-r from-dimzia-light to-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-serif text-3xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              <AnimatedText text="Our Dim Sum Catalog" type="word" animation="slide" />
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-gray-600 max-w-xl mx-auto"
            >
              Explore our extensive selection of handcrafted dim sum, made with authentic recipes
            </motion.p>
          </div>
          
          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search dim sum..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dimzia-primary focus:border-transparent"
                />
              </div>
              
              {/* Category Filter */}
              <div className="md:w-1/3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dimzia-primary focus:border-transparent appearance-none bg-white"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Food Items Grid */}
      <section className="py-12 container mx-auto px-4">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <FoodItem key={item.id} item={item} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filter to find what you're looking for
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Catalog;
