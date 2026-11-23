import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 lg:bottom-6 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-600 text-white px-3.5 py-2 text-xs font-semibold shadow-xl shadow-amber-900/30 border border-amber-500/50"
        >
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Offline Mode — All changes saved locally on device.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
