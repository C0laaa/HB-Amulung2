import React from 'react';
import { motion } from 'motion/react';
import { Plus, Coffee, Utensils, Cake, Flame, Snowflake, AlertCircle } from 'lucide-react';
import { MenuItem } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onSelect }) => {
  const isOutOfStock = item.isAvailable === false;

  // Determine pricing display text
  const getPricingString = (): string => {
    if (item.price !== undefined) {
      return `₱${item.price}`;
    }

    // For drinks with prices object
    const prices = item.prices;
    if (!prices) return '₱0';

    if (prices.small && prices.medium) {
      if (prices.small === prices.medium) return `₱${prices.small}`;
      return `₱${prices.small} – ₱${prices.medium}`;
    } else if (prices.medium) {
      return `₱${prices.medium}`;
    } else if (prices.small) {
      return `₱${prices.small}`;
    }

    return '₱0';
  };

  // Render clear temperature / type badges
  const renderAvailabilityBadge = () => {
    if (item.type !== 'drink') {
      if (item.type === 'pastry') {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200/80">
            <Cake className="w-3 h-3 text-amber-700 shrink-0" /> Fresh Pastry
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200/80">
          <Utensils className="w-3 h-3 text-emerald-700 shrink-0" /> Hot Meal
        </span>
      );
    }

    const avail = item.availability || 'Hot / Iced';
    const isBoth = avail.includes('Hot') && avail.includes('Iced');
    const isIcedOnly = avail.includes('Iced') && !avail.includes('Hot');
    const isHotOnly = avail.includes('Hot') && !avail.includes('Iced');

    if (isBoth) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10px] font-black bg-amber-50 text-amber-950 border border-amber-300/90 shadow-2xs">
          <span className="flex items-center gap-0.5 text-red-600">
            <Flame className="w-3 h-3 fill-red-500 shrink-0" /> Hot
          </span>
          <span className="text-amber-400 font-semibold">&amp;</span>
          <span className="flex items-center gap-0.5 text-sky-600">
            <Snowflake className="w-3 h-3 shrink-0" /> Iced
          </span>
        </span>
      );
    }

    if (isIcedOnly) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10px] font-black bg-sky-50 text-sky-950 border border-sky-300/90 shadow-2xs">
          <Snowflake className="w-3 h-3 text-sky-500 shrink-0" /> Iced Only
        </span>
      );
    }

    if (isHotOnly) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10px] font-black bg-red-50 text-red-950 border border-red-300/90 shadow-2xs">
          <Flame className="w-3 h-3 text-red-500 fill-red-500 shrink-0" /> Hot Only
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10px] font-bold bg-brand-light text-brand-dark border border-brand-border/80">
        <Coffee className="w-3 h-3 text-brand-gold shrink-0" /> {avail}
      </span>
    );
  };

  return (
    <motion.div
      id={`menu-item-${item.id}`}
      whileHover={isOutOfStock ? {} : { y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={() => onSelect(item)}
      className={`rounded-2xl border transition-all flex flex-col h-full group p-3 sm:p-4 justify-between gap-2.5 overflow-hidden relative ${
        isOutOfStock
          ? 'bg-stone-50/90 border-stone-200/90 cursor-pointer hover:border-rose-300 opacity-90'
          : 'bg-white border-brand-border/70 shadow-xs hover:shadow-md hover:border-brand-gold cursor-pointer'
      }`}
    >
      {/* Badges container when browsing menu */}
      <div className="flex flex-wrap gap-1.5 items-center justify-between">
        <div className="flex flex-wrap gap-1.5 items-center">
          {renderAvailabilityBadge()}

          {item.popular && !isOutOfStock && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-300 text-stone-950 border border-amber-400">
              ★ Popular
            </span>
          )}
        </div>

        {isOutOfStock && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300/90 shadow-2xs">
            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" /> Out of Stock
          </span>
        )}
      </div>

      {/* Details Section */}
      <div className="space-y-1 flex-1">
        {/* Item Name */}
        <h3 className={`font-sans text-xs sm:text-base font-bold leading-snug line-clamp-2 ${
          isOutOfStock ? 'text-stone-500' : 'text-brand-dark group-hover:text-brand-gold transition-colors'
        }`}>
          {item.name}
        </h3>

        {/* Description */}
        <p className="text-[10.5px] sm:text-xs text-stone-500 line-clamp-2 sm:line-clamp-3 leading-snug sm:leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Bottom Row: Price & Plus / Out of stock button */}
      <div className="pt-2 sm:pt-2.5 border-t border-stone-100 flex items-center justify-between gap-1.5">
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[8.5px] sm:text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Price</span>
          <span className={`font-mono text-xs sm:text-sm font-black truncate block ${
            isOutOfStock ? 'text-stone-400 line-through' : 'text-[#78350F]'
          }`}>
            {getPricingString()}
          </span>
        </div>

        {isOutOfStock ? (
          <div className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1">
            Sold Out
          </div>
        ) : (
          <div className="bg-brand-gold/15 group-hover:bg-brand-gold text-brand-gold group-hover:text-white p-1.5 sm:p-2 rounded-xl transition-all active:scale-95 flex items-center justify-center shrink-0 shadow-2xs">
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MenuItemCard;

