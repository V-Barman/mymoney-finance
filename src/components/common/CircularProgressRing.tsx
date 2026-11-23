import React from 'react';
import { motion } from 'motion/react';

interface CircularProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColorClass?: string;
  labelClassName?: string;
  showPercentSymbol?: boolean;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  percentage,
  size = 64,
  strokeWidth = 6,
  color = '#059669',
  trackColorClass = 'stroke-slate-200 dark:stroke-slate-800',
  labelClassName = 'text-xs font-bold font-mono tabular-nums text-slate-900 dark:text-white',
  showPercentSymbol = true,
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg className="-rotate-90 w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackColorClass}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <span className={`absolute ${labelClassName}`}>
        {clamped}
        {showPercentSymbol ? '%' : ''}
      </span>
    </div>
  );
};
