
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header 
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        isScrolled ? "py-3 glass-effect" : "py-5 bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="text-2xl font-serif font-medium text-dimzia-dark hover:text-dimzia-primary transition-colors"
        >
          Dimzia
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <Link 
            to="/" 
            className={cn("nav-item", isActive('/') && "active")}
          >
            Home
          </Link>
          <Link 
            to="/catalog" 
            className={cn("nav-item", isActive('/catalog') && "active")}
          >
            Catalog
          </Link>
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-dimzia-dark hover:text-dimzia-primary transition-colors"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden glass-effect animate-fade-in">
          <nav className="container mx-auto px-4 py-5 flex flex-col space-y-4">
            <Link 
              to="/" 
              className={cn(
                "px-4 py-2 hover:bg-dimzia-light rounded-md transition-colors",
                isActive('/') && "text-dimzia-primary"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/catalog" 
              className={cn(
                "px-4 py-2 hover:bg-dimzia-light rounded-md transition-colors",
                isActive('/catalog') && "text-dimzia-primary"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              Catalog
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
