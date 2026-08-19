import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Snowflake, Coffee, Check } from 'lucide-react';
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

  // Track user selections.
  const [selectedTemp, setSelectedTemp] = useState<'Hot' | 'Iced' | null>(null);
  const [selectedSize, setSelectedSize] = useState<'Small' | 'Medium' | null>(null);
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [imageFailed, setImageFailed] = useState(false);

  // Parse availability (e.g. 'Hot Only', 'Iced Only', 'Hot / Iced')
  const availability = item.availability || 'Hot / Iced';
  const isIcedOnly = availability === 'Iced Only' || availability === 'Iced';
  const isHotOnly = availability === 'Hot Only' || availability === 'Hot';
  const allowsHot = !isIcedOnly;
  const allowsIced = !isHotOnly;

  const hasSmall = Boolean(item.prices?.small);
  const hasMedium = Boolean(item.prices?.medium);

  useEffect(() => {
    if (isOpen) {
      setSelectedTemp(null);
      setSelectedSize(null);
      setSelectedUpgrades([]);
      setSelectedExtras([]);
      setQuantity(1);
      setImageFailed(false);

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

  const toggleUpgrade = (name: string) => {
    setSelectedUpgrades(prev => {
      if (prev.includes(name)) {
        return [];
      } else {
        return [name];
      }
    });
  };

  const toggleExtra = (name: string) => {
    setSelectedExtras(prev => {
      if (prev.includes(name)) {
        return prev.filter(e => e !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  const getBasePrice = (): number => {
    if (!selectedSize) return 0;
    if (selectedSize === 'Small') return item.prices?.small || 0;
    if (selectedSize === 'Medium') return item.prices?.medium || 0;
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

  const isConfigurationComplete = selectedTemp !== null && selectedSize !== null;

  const handleAdd = () => {
    if (!isConfigurationComplete) return;

    const customization: DrinkCustomization = {
      temperature: selectedTemp!,
      size: selectedSize!,
      upgrades: selectedUpgrades,
      extras: selectedExtras,
    };

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
            {/* Header with Drink Image & Close Button */}
            <div className="relative bg-brand-dark p-6 text-white shrink-0 overflow-hidden">
              {/* Background gradient & art */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-stone-900 to-brand-brown opacity-90" />
              
              <button
                id="close-drink-modal"
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors cursor-pointer border border-stone-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-1 flex gap-4 items-center">
                <div className="w-18 h-18 rounded-2xl bg-white/10 p-1 flex items-center justify-center shrink-0 border border-white/20 overflow-hidden shadow-inner">
                  {item.image && !imageFailed ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      onError={() => setImageFailed(true)}
                      className="w-full h-full object-cover rounded-xl" 
                    />
                  ) : (
                    <Coffee className="w-9 h-9 text-brand-yellow" />
                  )}
                </div>
                <div className="space-y-1 min-w-0 pr-8">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-brand-gold/30 text-brand-yellow border border-brand-gold/40">
                    {item.category}
                  </span>
                  <h2 className="text-lg font-sans font-bold text-white leading-tight">
                    {item.name}
                  </h2>
                  <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Customization Options Form */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-brand-cream/60">
              {/* Step 1: Temperature (Hot / Iced) */}
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
                  {/* Small option */}
                  <button
                    id="size-small-button"
                    disabled={!hasSmall}
                    onClick={() => setSelectedSize('Small')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all relative ${
                      !hasSmall
                        ? 'opacity-45 bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                        : selectedSize === 'Small'
                        ? 'border-brand-gold bg-brand-yellow/30 text-brand-deep shadow-sm shadow-brand-yellow/20 ring-1 ring-brand-gold'
                        : 'border-stone-200 bg-white hover:border-brand-gold text-stone-700'
                    }`}
                  >
                    {!hasSmall && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded-sm">
                        Unavailable
                      </span>
                    )}
                    <span className="text-xs text-stone-700 font-bold tracking-wider uppercase mb-0.5">Small</span>
                    <span className="text-[10px] text-stone-400 font-medium mb-1">12 oz (350ml)</span>
                    <span className="font-mono font-black text-base text-brand-dark">
                      {hasSmall ? `₱${item.prices?.small}` : 'N/A'}
                    </span>
                  </button>

                  {/* Large / Medium option */}
                  <button
                    id="size-medium-button"
                    disabled={!hasMedium}
                    onClick={() => setSelectedSize('Medium')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all relative ${
                      !hasMedium
                        ? 'opacity-45 bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                        : selectedSize === 'Medium'
                        ? 'border-brand-gold bg-brand-yellow/30 text-brand-deep shadow-sm shadow-brand-yellow/20 ring-1 ring-brand-gold'
                        : 'border-stone-200 bg-white hover:border-brand-gold text-stone-700'
                    }`}
                  >
                    {!hasMedium && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded-sm">
                        Unavailable
                      </span>
                    )}
                    <span className="text-xs text-stone-700 font-bold tracking-wider uppercase mb-0.5">Large</span>
                    <span className="text-[10px] text-stone-400 font-medium mb-1">16 oz (475ml)</span>
                    <span className="font-mono font-black text-base text-brand-dark">
                      {hasMedium ? `₱${item.prices?.medium}` : 'N/A'}
                    </span>
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
                disabled={item.isAvailable === false || !isConfigurationComplete}
                onClick={handleAdd}
                className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wider uppercase transition-all shadow-md ${
                  item.isAvailable === false
                    ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-none cursor-not-allowed'
                    : isConfigurationComplete
                    ? 'bg-brand-gold hover:bg-brand-accent active:scale-[0.98] text-white shadow-brand-gold/10'
                    : 'bg-stone-150 text-stone-400 border border-stone-200 shadow-none cursor-not-allowed'
                }`}
              >
                {item.isAvailable === false
                  ? 'Currently Out of Stock'
                  : isConfigurationComplete
                  ? 'Add to Cart'
                  : 'Configure Temperature & Size First'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
