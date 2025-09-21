import React from 'react';
import { Palette } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-purple-400 rounded-full blur-sm opacity-75"></div>
        <div className="relative bg-gradient-to-r from-yellow-400 to-purple-400 rounded-full p-2">
          <Palette className={`${iconSizes[size]} text-gray-900`} />
        </div>
      </div>
      <span className={`font-bold bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent ${sizeClasses[size]}`}>
        KalaHasta
      </span>
    </div>
  );
};

export default Logo;