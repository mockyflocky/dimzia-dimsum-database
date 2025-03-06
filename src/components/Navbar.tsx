
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Logo from './Logo';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header 
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        isScrolled ? "py-3 glass-effect" : "py-5 bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <Logo />
      </div>
    </header>
  );
};

export default Navbar;
