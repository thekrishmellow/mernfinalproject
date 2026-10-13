import React from 'react';

export function ProgressRing({
  percentage = 0,
  size = 72,
  strokeWidth = 6,
  strokeColor = '#F59E0B',
  trackColor = '#E2E8F0',
  textColor = 'text-slate-800',
  showLabel = true,
  children
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Value */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center font-bold font-mono">
        {children ? (
          children
        ) : showLabel ? (
          <span className={`text-xs ${textColor}`}>{Math.round(percentage)}%</span>
        ) : null}
      </div>
    </div>
  );
}
