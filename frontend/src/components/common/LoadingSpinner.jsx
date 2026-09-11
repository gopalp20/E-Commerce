import React from 'react';
import { Loader2 } from 'lucide-react';

const SIZES = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  return (
    <Loader2
      className={`animate-spin text-indigo-600 ${SIZES[size] || SIZES.md} ${className}`}
    />
  );
};
