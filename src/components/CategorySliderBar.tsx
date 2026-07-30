import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sliders } from 'lucide-react';

interface CategorySliderBarProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategorySliderBar: React.FC<CategorySliderBarProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Update scroll indicators
  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < maxScroll - 2);
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [categories]);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -180, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 180, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (category: string, e: React.MouseEvent<HTMLButtonElement>) => {
    onSelectCategory(category);
    // Scroll active item into view
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  return (
    <div className="space-y-1.5 bg-white/60 p-2.5 sm:p-3 rounded-2xl border border-brand-border/40 shadow-2xs">
      <div className="flex justify-between items-center pl-1 pr-1">
        <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
          <Sliders className="w-3 h-3 text-brand-gold" /> Categories
        </span>
        <span className="text-[10px] font-bold text-stone-400">
          Scroll to explore ({categories.length})
        </span>
      </div>

      {/* Main Container with Category Chips and Navigation Arrows */}
      <div className="relative flex items-center gap-1.5">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={handleScrollLeft}
          disabled={!canScrollLeft}
          className={`p-1.5 rounded-full border transition-all shrink-0 cursor-pointer ${
            canScrollLeft
              ? 'bg-white text-stone-800 border-stone-300 hover:bg-brand-cream hover:border-brand-gold shadow-xs active:scale-95'
              : 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed opacity-40'
          }`}
          title="Scroll Left"
          aria-label="Scroll left categories"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Category Chips Container */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-2 overflow-x-auto scrollbar-none py-1 scroll-smooth touch-pan-x flex-1 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                id={`category-filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={(e) => handleCategoryClick(category, e)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-brand-yellow text-brand-deep border-brand-gold shadow-xs font-black'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-brand-gold hover:bg-stone-50'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={handleScrollRight}
          disabled={!canScrollRight}
          className={`p-1.5 rounded-full border transition-all shrink-0 cursor-pointer ${
            canScrollRight
              ? 'bg-white text-stone-800 border-stone-300 hover:bg-brand-cream hover:border-brand-gold shadow-xs active:scale-95'
              : 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed opacity-40'
          }`}
          title="Scroll Right"
          aria-label="Scroll right categories"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CategorySliderBar;
