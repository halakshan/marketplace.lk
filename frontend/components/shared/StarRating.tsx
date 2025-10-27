'use client';

import { FiStar } from 'react-icons/fi';

interface Props {
  rating: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, max = 5, size = 16, interactive = false, onChange }: Props) {
  return (
    <div className="flex items-center space-x-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <FiStar
          key={i}
          size={size}
          onClick={() => interactive && onChange && onChange(i + 1)}
          className={`${i < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
            ${interactive ? 'cursor-pointer hover:text-yellow-400 hover:fill-current transition-colors' : ''}`}
        />
      ))}
    </div>
  );
}
