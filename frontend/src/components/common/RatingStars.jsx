import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({
  rating = 5,
  maxStars = 5,
  size = 'md',
  showScore = false,
  reviewCount,
  interactive = false,
  onChange,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-7 h-7',
  };

  const currentRating = interactive && hoverRating ? hoverRating : rating;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= Math.round(currentRating);

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              onClick={() => interactive && onChange && onChange(starValue)}
              className={`${
                interactive
                  ? 'cursor-pointer hover:scale-110 transition-transform p-0.5'
                  : 'cursor-default'
              }`}
            >
              <Star
                className={`${starSizes[size] || starSizes.md} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-200 text-slate-200'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="text-xs font-semibold text-slate-900 ml-0.5">
          {Number(rating).toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className="text-xs text-slate-500">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
