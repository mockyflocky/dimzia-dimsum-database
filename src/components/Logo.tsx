
import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center">
      <img 
        src="/logo-placeholder.png" 
        alt="Dimzia Logo" 
        className="h-10 w-auto"
      />
    </Link>
  );
};

export default Logo;
