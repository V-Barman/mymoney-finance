import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

interface WealthTiltCardProps {
  children: React.ReactNode;
  className?: string;
}

export const WealthTiltCard: React.FC<WealthTiltCardProps> = ({ children, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const sheenX = useMotionValue(50);
  const sheenY = useMotionValue(25);
  const sheenOpacity = useMotionValue(0);

  const rotateX = useSpring(rawRotateX, { stiffness: 220, damping: 24 });
  const rotateY = useSpring(rawRotateY, { stiffness: 220, damping: 24 });
  const smoothSheenOpacity = useSpring(sheenOpacity, { stiffness: 220, damping: 28 });

  const sheenBackground = useMotionTemplate`radial-gradient(240px circle at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.16), transparent 72%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || e.pointerType === 'touch') return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    rawRotateX.set((0.5 - py) * 5);
    rawRotateY.set((px - 0.5) * 6);
    sheenX.set(px * 100);
    sheenY.set(py * 100);
    sheenOpacity.set(1);
  };

  const handlePointerLeave = () => {
    rawRotateX.set(0);
    rawRotateY.set(0);
    sheenOpacity.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        shouldReduceMotion
          ? undefined
          : {
              transformPerspective: 900,
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }
      }
      className={`relative overflow-hidden ${className}`}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: sheenBackground,
          opacity: smoothSheenOpacity,
        }}
      />
      <div className="relative z-10 h-full flex flex-col justify-between">{children}</div>
    </motion.div>
  );
};
