import React from 'react';
import { Star } from 'lucide-react';

interface StarBadgeProps {
  active?: boolean;
  size?: number;
  animate?: boolean;
}

export const StarBadge: React.FC<StarBadgeProps> = ({
  active = true,
  size = 28,
  animate = false,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center transition-all duration-500 ${
        animate ? 'animate-bounce' : ''
      }`}
    >
      <Star
        size={size}
        className={`transition-colors duration-300 ${
          active
            ? 'fill-amber-400 text-amber-500 drop-shadow-sm'
            : 'fill-slate-200 text-slate-300'
        }`}
      />
    </div>
  );
};
