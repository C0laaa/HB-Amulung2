import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Snowflake, Coffee, Sparkles, Check } from 'lucide-react';
import { MenuItem, DrinkCustomization, CartItem } from '../types';
import { UPGRADES, EXTRAS } from '../data';

interface DrinkCustomizerModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export default function DrinkCustomizerModal({
  item,
  isOpen,
  onClose,
  onAddToCart,
}: DrinkCustomizerModalProps) {
  if (!item) return null;

  // Track user selections. Set to null initially if multiple options exist,
  // requiring the user to explicitly configure them as requested!
  const [selectedTemp, setSelectedTemp] = useState<'Hot' | 'Iced' | null>(null);
  const [selectedSize, setSelectedSize] = useState<'Small' | 'Medium' | null>(null);
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);

  // Parse availability to see what temperatures are valid
  const availability = item.availability || 'Hot / Iced';
  const allowsHot = availability.includes('Hot') || availability === 'Iced' ? availability !== 'Iced' && availability !== 'Iced Only' && availability !== 'Iced' : true;
  const allowsIced = availability.includes('Iced') || availability === 'Iced Only' || availability === 'Iced' || availability.includes('Iced');

  // Determine available sizes based on prices dictionary
  const hasSmall = item.prices?.small !== undefined;
  const hasMedium = item.prices?.medium !== undefined;

  // Auto-configure if there is only exactly one choice, or let them select
  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setSelectedTemp(null);
      setSelectedSize(null);
      setSelectedUpgrades([]);
      setSelectedExtras([]);
      setQuantity(1);

      // If only one temperature is possible, we can pre-highlight it, but let's require user to tap/interact,
      // or we can auto-select if it's the only option and consider it configured. Let's make it extremely clear.
      if (allowsHot && !allowsIced) {
        setSelectedTemp('Hot');
      } else if (allowsIced && !allowsHot) {
        setSelectedTemp('Iced');
      }

      if (hasSmall && !hasMedium) {
        setSelectedSize('Small');
      } else if (hasMedium && !hasSmall) {
        setSelectedSize('Medium');
      }
    }
  }, [isOpen, item, allowsHot, allowsIced, hasSmall, hasMedium]);

  // Handle upgrade selection (checklist for milk alternatives, choosing 1 milk base is premium)
  const toggleUpgrade = (name: string) => {
    setSelectedUpgrades(prev => {
      if (prev.includes(name)) {
        return [];
      } else {
        return [name]; // Limit to single milk upgrade for realistic ordering
      }
    });
  };

  // Handle extras selection (checklist for add-ons)
  const toggleExtra = (name: string) => {
    setSelectedExtras(prev => {
      if (prev.includes(name)) {
        return prev.filter(e => e !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  // Dynamic pricing calculation
  const getBasePrice = (): number => {
    if (!selectedSize) return 0;
    if (selectedSize === 'Small' && hasSmall) return item.prices?.small || 0;
    if (selectedSize === 'Medium' && hasMedium) return item.prices?.medium || 0;
    return 0;
  };

  const getCustomizationPrice = (): number => {
    let price = 0;
    selectedUpgrades.forEach(upName => {
      const upgrade = UPGRADES.find(u => u.name === upName);
      if (upgrade) price += upgrade.price;
    });
    selectedExtras.forEach(exName => {
      const extra = EXTRAS.find(e => e.name === exName);
      if (extra) price += extra.price;
    });
    return price;
  };

  const singleItemPrice = getBasePrice() + getCustomizationPrice();
  const totalPrice = singleItemPrice * quantity;

  // Check if both size and temperature configurations are complete
  const isConfigurationComplete = selectedTemp !== null && selectedSize !== null;

  const handleAdd = () => {
    if (!isConfigurationComplete) return;

    const customization: DrinkCustomization = {
      temperature: selectedTemp!,
      size: selectedSize!,
      upgrades: selectedUpgrades,
      extras: selectedExtras,
    };

    // Calculate a unique hash or ID for this customized item so duplicates of the same customization merge,
    // but different customizations remain distinct items in the cart!
    const customizationHash = `${item.id}-${customization.temperature}-${customization.size}-${customization.upgrades.sort().join(',')}-${customization.extras.sort().join(',')}`;

    onAddToCart({
      id: customizationHash,
      menuItem: item,
      quantity,
      customization,
      calculatedPrice: singleItemPrice,
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
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-brand-cream rounded-t-3xl shadow-2xl z-50 flex flex-col max-h-[92vh] border border-brand-border overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-5 border-b border-brand-border flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-brand-gold" />
                <span className="text-xs uppercase tracking-widest font-bold text-brand-accent">Customize Drink</span>
              </div>
              <button
                id="close-customize-modal"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="overflow-y-auto p-5 space-y-6 flex-1 bg-gradient-to-b from-white to-brand-cream/20">
              {/* Product Info */}
              <div className="space-y-4 pb-4 border-b border-brand-border/60">
                {item.image && (
                  <div className="relative w-full max-h-[320px] sm:max-h-[380px] h-64 sm:h-72 rounded-2xl overflow-hidden bg-stone-100 border border-brand-border/60 shadow-md">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-2xl"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-sans text-lg font-bold text-brand-dark leading-snug">{item.name}</h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>

              {/* Step 1: Temperature Toggle (Required) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-brand-dark flex items-center gap-1.5">
                    1. Select Temperature <span className="text-red-500">*</span>
                  </label>
                  {!selectedTemp && (
                    <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-md font-medium animate-pulse">Required</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {/* Hot option */}
                  <button
                    id="temp-hot-button"
                    disabled={!allowsHot}
                    onClick={() => setSelectedTemp('Hot')}
                    className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 text-sm font-semibold transition-all ${
                      !allowsHot
                        ? 'opacity-40 bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                        : selectedTemp === 'Hot'
                        ? 'border-red-500 bg-red-50 text-red-900 shadow-sm shadow-red-100/50'
                        : 'border-stone-200 bg-white hover:border-amber-300 text-stone-700'
                    }`}
                  >
                    <Flame className={`w-4 h-4 ${selectedTemp === 'Hot' ? 'text-red-500 fill-red-500' : 'text-stone-400'}`} />
                    <span>Hot</span>
                  </button>

                  {/* Iced option */}
                  <button
                    id="temp-iced-button"
                    disabled={!allowsIced}
                    onClick={() => setSelectedTemp('Iced')}
                    className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 text-sm font-semibold transition-all ${
                      !allowsIced
                        ? 'opacity-40 bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                        : selectedTemp === 'Iced'
                        ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-sm shadow-sky-100/50'
                        : 'border-stone-200 bg-white hover:border-amber-300 text-stone-700'
                    }`}
                  >
                    <Snowflake className={`w-4 h-4 ${selectedTemp === 'Iced' ? 'text-sky-500' : 'text-stone-400'}`} />
                    <span>Iced</span>
                  </button>
                </div>
                {(!allowsHot || !allowsIced) && (
                  <p className="text-[11px] text-stone-500 italic">
                    * This signature blend is only available {allowsIced ? 'Iced' : 'Hot'}.
                  </p>
                )}
              </div>

              {/* Step 2: Size Selection (Required) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-brand-dark flex items-center gap-1.5">
                    2. Select Size <span className="text-red-500">*</span>
                  </label>
                  {!selectedSize && (
                    <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-md font-medium animate-pulse">Required</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {/* Small Size */}
                  <button
                    id="size-small-button"
                    disabled={!hasSmall}
                    onClick={() => setSelectedSize('Small')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                      !hasSmall
                        ? 'opacity-40 bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                        : selectedSize === 'Small'
                        ? 'border-brand-gold bg-brand-yellow/30 text-brand-deep shadow-sm shadow-brand-yellow/20'
                        : 'border-stone-200 bg-white hover:border-brand-gold text-stone-700'
                    }`}
                  >
                    <span className="text-xs text-stone-400 font-bold tracking-wider uppercase mb-0.5">Small</span>
                    <span className="font-mono font-bold text-base">₱{item.prices?.small}</span>
                  </button>

                  {/* Medium Size */}
                  <button
                    id="size-medium-button"
                    disabled={!hasMedium}
                    onClick={() => setSelectedSize('Medium')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                      !hasMedium
                        ? 'opacity-40 bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                        : selectedSize === 'Medium'
                        ? 'border-brand-gold bg-brand-yellow/30 text-brand-deep shadow-sm shadow-brand-yellow/20'
                        : 'border-stone-200 bg-white hover:border-brand-gold text-stone-700'
                    }`}
                  >
                    <span className="text-xs text-stone-400 font-bold tracking-wider uppercase mb-0.5">Medium</span>
                    <span className="font-mono font-bold text-base">₱{item.prices?.medium}</span>
                  </button>
                </div>
              </div>

              {/* Step 3: Upgrades (Milk alternatives, optional) */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <label className="text-sm font-bold text-brand-dark">3. Milk Alternative (Optional)</label>
                  <span className="text-[10px] text-stone-400 italic">Select one alternative</span>
                </div>
                <div className="space-y-2">
                  {UPGRADES.map(upgrade => {
                    const isChecked = selectedUpgrades.includes(upgrade.name);
                    return (
                      <div
                        key={upgrade.name}
                        onClick={() => toggleUpgrade(upgrade.name)}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          isChecked
                            ? 'border-brand-gold bg-brand-yellow/20 text-brand-deep'
                            : 'border-stone-100 hover:border-brand-gold/40 bg-white text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-brand-gold border-brand-gold text-white' : 'border-stone-300 bg-white'
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-semibold">{upgrade.name}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-brand-accent">+₱{upgrade.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Extras (Add-ons, optional checklist) */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-brand-dark">4. Extras / Add-ons (Optional)</label>
                <div className="grid grid-cols-1 gap-2">
                  {EXTRAS.map(extra => {
                    const isChecked = selectedExtras.includes(extra.name);
                    return (
                      <div
                        key={extra.name}
                        onClick={() => toggleExtra(extra.name)}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          isChecked
                            ? 'border-brand-gold bg-brand-yellow/20 text-brand-deep'
                            : 'border-stone-100 hover:border-brand-gold/40 bg-white text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-brand-gold border-brand-gold text-white' : 'border-stone-300 bg-white'
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-semibold">{extra.name}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-brand-accent">+₱{extra.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Panel with Quantity & Dynamic Pricing */}
            <div className="p-5 border-t border-brand-border bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Dynamic Total</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-sans font-black text-brand-dark">
                      ₱{selectedSize ? totalPrice : '—'}
                    </span>
                    {selectedSize && (
                      <span className="text-[11px] text-stone-500">
                        ({quantity} × ₱{singleItemPrice})
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200/50">
                  <button
                    id="qty-decrement"
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
                    id="qty-increment"
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 font-extrabold hover:bg-white transition-all text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart button */}
              <button
                id="add-to-cart-button"
                disabled={!isConfigurationComplete}
                onClick={handleAdd}
                className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wider uppercase transition-all shadow-md ${
                  isConfigurationComplete
                    ? 'bg-brand-gold hover:bg-brand-accent active:scale-[0.98] text-white shadow-brand-gold/10'
                    : 'bg-stone-150 text-stone-400 border border-stone-200 shadow-none cursor-not-allowed'
                }`}
              >
                {isConfigurationComplete ? 'Add to Cart' : 'Configure Temperature & Size First'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
