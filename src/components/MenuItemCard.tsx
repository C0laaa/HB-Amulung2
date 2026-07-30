import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Plus, Coffee, Utensils, Cake } from 'lucide-react';
import { MenuItem } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onSelect }) => {
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

  return (
    <motion.div
      id={`menu-item-${item.id}`}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={() => onSelect(item)}
      className="bg-white rounded-2xl border border-brand-border/60 shadow-xs hover:shadow-md hover:border-brand-gold transition-all cursor-pointer flex flex-col h-full group p-3 sm:p-5 justify-between gap-2.5 sm:gap-3 overflow-hidden"
    >
      {/* Top Details Row: Badges, Name, Description */}
      <div className="space-y-1.5 sm:space-y-2 flex-1">
        {/* Badges container */}
        <div className="flex flex-wrap gap-1 items-center">
          {item.type === 'drink' ? (
            <span className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-bold bg-brand-light text-brand-accent border border-brand-border/40">
              <Coffee className="w-2.5 h-2.5 text-brand-gold" /> Custom
            </span>
          ) : item.type === 'pastry' ? (
            <span className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-bold bg-amber-50 text-amber-900 border border-amber-200/60">
              <Cake className="w-2.5 h-2.5 text-amber-700" /> Fresh
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-bold bg-brand-light text-emerald-800 border border-brand-border/40">
              <Utensils className="w-2.5 h-2.5 text-emerald-700" /> Hot Meal
            </span>
          )}
          {item.popular && (
            <span className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
              ★ Popular
            </span>
          )}
        </div>

        {/* Item Name */}
        <h3 className="font-sans text-xs sm:text-base md:text-lg font-bold text-brand-dark leading-snug group-hover:text-brand-gold transition-colors line-clamp-2">
          {item.name}
        </h3>

        {/* Description */}
        <p className="text-[10.5px] sm:text-xs text-stone-500 line-clamp-2 sm:line-clamp-3 leading-snug sm:leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Bottom Row: Availability & Price + Plus button */}
      <div className="pt-2 sm:pt-3 border-t border-brand-light/60 flex items-center justify-between gap-1.5">
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[8px] sm:text-[9px] text-brand-warm font-semibold truncate">
            {item.availability || 'All Day'}
          </span>
          <span className="font-mono text-xs sm:text-sm font-black text-[#78350F] truncate block">
            {getPricingString()}
          </span>
        </div>

        <div className="bg-brand-gold/15 group-hover:bg-brand-gold text-brand-gold group-hover:text-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all active:scale-95 flex items-center justify-center shrink-0">
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
        </div>
      </div>
    </motion.div>
  );
};

export default MenuItemCard;

