import React, { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '../../utils/currency';

interface AnimatedCounterProps {
  value: number; // in minor units
  currencyCode?: string;
  currency?: string;
  className?: string;
  options?: {
    compact?: boolean;
    hideDecimals?: boolean;
    showSign?: boolean;
  };
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  currencyCode,
  currency = 'INR',
  className = '',
  options = {},
}) => {
  const activeCurrency = currencyCode || currency;
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // If user prefers reduced motion, update immediately
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const startValue = prevValueRef.current;
    const endValue = value;
    const delta = endValue - startValue;

    if (delta === 0) return;

    const duration = 500; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic curve
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + delta * ease);

      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      prevValueRef.current = value;
    };
  }, [value]);

  return (
    <span className={`tabular-nums font-mono ${className}`}>
      {formatCurrency(displayValue, activeCurrency, options)}
    </span>
  );
};
