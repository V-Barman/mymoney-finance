import confetti from 'canvas-confetti';

/**
 * Triggers a celebratory emerald & gold confetti burst
 * Respects window.matchMedia('(prefers-reduced-motion: reduce)')
 */
export function triggerGoalCelebration() {
  if (typeof window === 'undefined') return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  try {
    // Left burst
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#059669', '#10b981', '#34d399', '#f59e0b', '#fbbf24'],
      disableForReducedMotion: true,
    });

    // Right burst
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#059669', '#10b981', '#34d399', '#f59e0b', '#fbbf24'],
      disableForReducedMotion: true,
    });
  } catch (err) {
    // Non-fatal if canvas context is restricted
    console.debug('Confetti burst skipped:', err);
  }
}
