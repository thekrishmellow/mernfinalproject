import React from 'react';
import { cn } from '../../utils/cn.js';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-100 rounded-3xl p-6 shadow-sm',
        hover && 'transition-all duration-150 hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
