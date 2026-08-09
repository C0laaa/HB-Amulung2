import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Truck, Bell, X, Sparkles, ShoppingBag, Coffee } from 'lucide-react';

export interface CustomerNotificationData {
  id: string;
  orderId: string;
  type: 'ready' | 'delivery' | 'completed' | 'pending';
  title: string;
  message: string;
  timestamp: string;
}

interface CustomerNotificationToastProps {
  notification: CustomerNotificationData | null;
  onDismiss: () => void;
  onOpenOrderTracker?: () => void;
}

export default function CustomerNotificationToast({
  notification,
  onDismiss,
  onOpenOrderTracker,
}: CustomerNotificationToastProps) {
  if (!notification) return null;

  const isReady = notification.type === 'ready';
  const isDelivery = notification.type === 'delivery';
  const isCompleted = notification.type === 'completed';

  return (
    <AnimatePresence>
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md pointer-events-auto"
      >
        <div
          className={`p-4 rounded-3xl shadow-2xl border flex flex-col gap-3 relative overflow-hidden backdrop-blur-md ${
            isReady
              ? 'bg-gradient-to-r from-amber-900 via-amber-950 to-stone-900 text-white border-amber-500/60 shadow-amber-900/30'
              : isDelivery
              ? 'bg-gradient-to-r from-sky-900 via-sky-950 to-stone-900 text-white border-sky-400/60 shadow-sky-900/30'
              : isCompleted
              ? 'bg-gradient-to-r from-emerald-900 via-emerald-950 to-stone-900 text-white border-emerald-500/60 shadow-emerald-900/30'
              : 'bg-stone-900 text-white border-stone-700'
          }`}
        >
          {/* Subtle background glow element */}
          <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {/* Icon Badge */}
              <div
                className={`p-2.5 rounded-2xl shrink-0 flex items-center justify-center shadow-md ${
                  isReady
                    ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300/50'
                    : isDelivery
                    ? 'bg-sky-400 text-stone-950 ring-2 ring-sky-200/50'
                    : isCompleted
                    ? 'bg-emerald-400 text-stone-950 ring-2 ring-emerald-200/50'
                    : 'bg-brand-gold text-white'
                }`}
              >
                {isReady && <ShoppingBag className="w-5 h-5 stroke-[2.5]" />}
                {isDelivery && <Truck className="w-5 h-5 stroke-[2.5] animate-bounce" />}
                {isCompleted && <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />}
                {!isReady && !isDelivery && !isCompleted && <Bell className="w-5 h-5" />}
              </div>

              <div className="space-y-0.5 min-w-0 pr-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/15 text-white/90">
                    Order #{notification.orderId}
                  </span>
                  <span className="text-[10px] text-white/60">{notification.timestamp}</span>
                </div>
                <h4 className="font-sans text-sm font-bold text-white leading-tight">
                  {notification.title}
                </h4>
                <p className="text-xs text-stone-200/90 leading-snug">
                  {notification.message}
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onDismiss}
              className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Row */}
          {onOpenOrderTracker && (
            <div className="flex justify-end pt-1 border-t border-white/10">
              <button
                onClick={() => {
                  onOpenOrderTracker();
                  onDismiss();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer ${
                  isReady
                    ? 'bg-amber-400 hover:bg-amber-300 text-stone-950'
                    : isDelivery
                    ? 'bg-sky-400 hover:bg-sky-300 text-stone-950'
                    : 'bg-white hover:bg-stone-100 text-stone-900'
                }`}
              >
                <span>View Order Status</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
