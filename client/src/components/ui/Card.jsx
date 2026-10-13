import React from 'react';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-lg backdrop-blur-sm ${
        hover ? 'transition-all duration-200 hover:border-slate-700 hover:shadow-xl hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
