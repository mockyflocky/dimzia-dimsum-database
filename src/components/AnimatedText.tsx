
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  type?: 'char' | 'word';
  animation?: 'fade' | 'slide';
  once?: boolean;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className,
  delay = 0.05,
  type = 'word',
  animation = 'fade',
  once = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const elements = Array.from(container.children) as HTMLElement[];
    
    const animateElements = () => {
      elements.forEach((element, index) => {
        // Reset styles before animating
        element.style.opacity = '0';
        element.style.transform = animation === 'slide' ? 'translateY(20px)' : 'none';
        
        // Add animation
        element.style.animation = animation === 'fade' 
          ? 'fade-in 0.5s forwards' 
          : 'slide-up 0.7s forwards';
        element.style.animationDelay = `${delay * index}s`;
      });
    };

    // Add necessary keyframes to document
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slide-up {
        from { 
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    
    if (once) {
      animateElements();
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateElements();
          } else {
            elements.forEach(element => {
              element.style.opacity = '0';
              element.style.animation = '';
            });
          }
        });
      }, { threshold: 0.1 });
      
      observer.observe(container);
      return () => {
        observer.disconnect();
        document.head.removeChild(style);
      };
    }

    return () => {
      document.head.removeChild(style);
    };
  }, [text, delay, animation, once]);
  
  const renderContent = () => {
    if (type === 'char') {
      return text.split('').map((char, index) => (
        <span key={index} className="inline-block">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ));
    }
    
    return text.split(' ').map((word, index) => (
      <span key={index} className="inline-block mx-[0.15em]">
        {word}
      </span>
    ));
  };
  
  return (
    <div ref={containerRef} className={cn("inline", className)}>
      {renderContent()}
    </div>
  );
};

export default AnimatedText;
