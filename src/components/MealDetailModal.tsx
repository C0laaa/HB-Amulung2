import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Utensils, Cake, Sparkles } from 'lucide-react';
import { MenuItem, CartItem } from '../types';

interface MealDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export default function MealDetailModal({
  item,
  isOpen,
  onClose,
  onAddToCart,
}: MealDetailModalProps) {
  if (!item) return null;

  const [quantity, setQuantity] = useState<number>(1);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setImageFailed(false);
    }
  }, [isOpen]);

  const basePrice = item.price || 0;
  const totalPrice = basePrice * quantity;

  const handleAdd = () => {
    onAddToCart({
      id: `${item.id}-standard`,
      menuItem: item,
      quantity,
      calculatedPrice: basePrice,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/60 z-50 backdrop-blur-xs"
          />

          {/* Sheet/Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-brand-cream rounded-t-3xl shadow-2xl z-50 flex flex-col max-h-[90vh] border border-brand-border overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-5 border-b border-brand-border flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                {item.type === 'pastry' ? (
                  <Cake className="w-5 h-5 text-amber-700" />
                ) : (
                  <Utensils className="w-5 h-5 text-brand-gold" />
                )}
                <span className="text-xs uppercase tracking-widest font-bold text-brand-accent">
                  {item.type === 'pastry' ? 'Add Pastry' : 'Add Meal'}
                </span>
              </div>
              <button
                id="close-meal-modal"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="overflow-y-auto p-5 space-y-5 flex-1 bg-gradient-to-b from-white to-brand-cream/20">
              {item.image && !imageFailed ? (
                <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-stone-100 border border-brand-border/60 shadow-xs flex items-center justify-center">
                  {/* Soft ambient background fill matching the photo's colors */}
                  <img
                    src={item.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-125 pointer-events-none"
                    aria-hidden="true"
                  />
                  {/* Uncropped full image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="relative max-w-full max-h-full object-contain p-1.5 z-10 drop-shadow-xs"
                    referrerPolicy="no-referrer"
                    onError={() => setImageFailed(true)}
                  />
                </div>
              ) : (
                <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100/70 border border-amber-200/80 flex flex-col items-center justify-center gap-2 p-4 text-center shadow-2xs">
                  <div className="p-3 bg-white/90 rounded-full shadow-xs">
                    {item.type === 'pastry' ? (
                      <Cake className="w-8 h-8 text-amber-700" />
                    ) : (
                      <Utensils className="w-8 h-8 text-emerald-700" />
                    )}
                  </div>
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wide">{item.name}</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-brand-gold font-bold uppercase tracking-wider">{item.category}</span>
                </div>
                <h3 className="font-sans text-xl font-bold text-brand-dark leading-tight">{item.name}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{item.description}</p>
              </div>

              {/* Nutrition/Allergy Note */}
              <div className="p-3.5 bg-brand-yellow/25 border border-brand-border/60 rounded-2xl">
                <h4 className="text-xs font-bold text-brand-deep mb-0.5">Freshly Prepared to Order</h4>
                <p className="text-[11px] text-brand-accent/90 leading-relaxed">
                  All meals at Honey Bakes Cafe are cooked fresh. Please let our barista or cashier know of any dietary allergies before payment.
                </p>
              </div>
            </div>

            {/* Bottom Panel with Quantity & Dynamic Pricing */}
            <div className="p-5 border-t border-brand-border bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total Price</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-sans font-black text-brand-dark">
                      ₱{totalPrice}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      ({quantity} × ₱{basePrice})
                    </span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200/50">
                  <button
                    id="meal-qty-decrement"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 font-extrabold hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-all text-lg"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-stone-850 text-sm">
                    {quantity}
                  </span>
                  <button
                    id="meal-qty-increment"
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 font-extrabold hover:bg-white transition-all text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart button */}
              <button
                id="meal-add-to-cart"
                onClick={handleAdd}
                className="w-full py-4 rounded-2xl bg-brand-gold hover:bg-brand-accent text-white font-bold text-sm tracking-wider uppercase transition-all shadow-md shadow-brand-gold/10 active:scale-[0.98]"
              >
                Add to Cart — ₱{totalPrice}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
