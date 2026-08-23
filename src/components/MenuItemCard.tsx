import React from 'react';
import { motion } from 'motion/react';
import { Plus, Cake, Flame, Snowflake, AlertCircle, Utensils } from 'lucide-react';
import { MenuItem } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onSelect }) => {
  const isOutOfStock = item.isAvailable === false;

  // Determine pricing display text
  const getPricingString = (): string => {
    if (item.price !== undefined && item.price !== null) {
      return `₱${item.price}`;
    }

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

  // Render clear temperature / type badges matching reference
  const renderAvailabilityBadge = () => {
    if (item.type !== 'drink') {
      if (item.type === 'pastry') {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
            <Cake className="w-3.5 h-3.5 text-amber-700 shrink-0" /> Fresh Pastry
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300">
          <Utensils className="w-3.5 h-3.5 text-emerald-700 shrink-0" /> Hot Meal
        </span>
      );
    }

    const avail = item.availability || 'Hot / Iced';
    const isBoth = avail.includes('Hot') && avail.includes('Iced');
    const isIcedOnly = avail.includes('Iced') && !avail.includes('Hot');
    const isHotOnly = avail.includes('Hot') && !avail.includes('Iced');

    if (isBoth) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-stone-50 text-stone-800 border border-stone-300">
          <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />
          <span className="text-red-600">Hot</span>
          <span className="text-stone-300 font-bold">&</span>
          <Snowflake className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span className="text-sky-600">Iced</span>
        </span>
      );
    }

    if (isIcedOnly) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-sky-50 text-sky-700 border border-sky-300">
          <Snowflake className="w-3.5 h-3.5 text-sky-500 shrink-0" /> Iced Only
        </span>
      );
    }

    if (isHotOnly) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-300">
          <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" /> Hot Only
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-stone-50 text-stone-700 border border-stone-300">
        {avail}
      </span>
    );
  };

  return (
    <motion.div
      id={`menu-item-${item.id}`}
      whileHover={isOutOfStock ? {} : { y: -3 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={() => onSelect(item)}
      className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between h-full group relative shadow-2xs hover:shadow-md cursor-pointer ${
        isOutOfStock
          ? 'bg-stone-50/80 border-stone-200 opacity-75 hover:border-rose-300'
          : 'bg-white border-[#F3E8DC] hover:border-amber-300'
      }`}
    >
      {/* Top Badges Row */}
      <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
        {renderAvailabilityBadge()}

        {item.popular && !isOutOfStock && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#FBBF24] text-stone-900 shadow-2xs">
            ★ Popular
          </span>
        )}

        {isOutOfStock && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" /> Sold Out
          </span>
        )}
      </div>

      {/* Item Title & Description */}
      <div className="mb-3.5">
        <h3 className={`font-sans text-base sm:text-lg font-bold leading-snug ${
          isOutOfStock ? 'text-stone-500' : 'text-[#3E2723] group-hover:text-amber-900 transition-colors'
        }`}>
          {item.name}
        </h3>
        {item.description && (
          <p className="text-xs sm:text-sm text-stone-500 line-clamp-3 leading-relaxed mt-1 font-normal">
            {item.description}
          </p>
        )}
      </div>

      {/* Bottom Bar: Pricing & Action Button */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-0.5">
            PRICE
          </span>
          <span className={`font-mono text-base sm:text-lg font-bold truncate block ${
            isOutOfStock ? 'text-stone-400 line-through' : 'text-[#5C3D28]'
          }`}>
            {getPricingString()}
          </span>
        </div>

        {isOutOfStock ? (
          <div className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
            Unavailable
          </div>
        ) : (
          <div className="w-10 h-10 rounded-2xl bg-[#FDEEDC] hover:bg-[#FCD8B5] text-[#C26D1A] flex items-center justify-center font-bold text-lg shadow-2xs transition-colors shrink-0">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MenuItemCard;
