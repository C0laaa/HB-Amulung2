import React from 'react';

export const LogoIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10 text-brand-dark" }) => {
  return (
    <svg
      viewBox="20 22 62 56"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Cup / Bowl Body */}
      <path d="M 24 46 C 24 71 36 76 48 76 C 60 76 70 70 70 46" />

      {/* Drips of glaze / honey on the left rim */}
      <path d="M 24 46 L 33 46 C 33 56 38 56 38 46 L 43 46 C 43 52 48 52 48 46 L 58 46" />

      {/* Cup Handle on the right */}
      <path d="M 70 51 C 80 51 81 63 70 65" />

      {/* Whisk handle angled pointing top-right */}
      <path d="M 68 31 L 51 57" />
      {/* Loop at end of whisk handle */}
      <ellipse cx="69.5" cy="29.5" rx="2" ry="3" transform="rotate(25 69.5 29.5)" />

      {/* Whisk balloon wire loop */}
      <path d="M 51 57 C 43 63 44 71 49 71 C 54 71 58 64 51 57 Z" />
      <path d="M 51 57 C 47 64 50 69 50 69" />
      <path d="M 51 57 C 50 62 53 68 53 68" />
    </svg>
  );
};

export interface CafeLogoProps {
  className?: string;
  showIcon?: boolean;
  iconSize?: string;
  iconPosition?: 'left' | 'right';
  align?: 'left' | 'center';
}

export const CafeLogo: React.FC<CafeLogoProps> = ({ 
  className = '', 
  showIcon = true,
  iconSize = 'w-12 h-12 sm:w-14 sm:h-14',
  iconPosition = 'right',
  align = 'left'
}) => {
  const logoIconMarkup = (
    <div className="shrink-0 text-brand-dark flex items-center justify-center">
      <LogoIcon className={iconSize} />
    </div>
  );

  return (
    <div className={`flex items-center ${align === 'center' ? 'justify-center' : 'justify-start'} gap-1.5 ${className}`}>
      {showIcon && iconPosition === 'left' && logoIconMarkup}
      <div className="flex flex-col leading-none">
        <span className="font-sans font-medium text-[20px] sm:text-[23px] tracking-[0.16em] text-brand-dark uppercase">
          HONEY BAKES
        </span>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="font-sans font-medium text-[20px] sm:text-[23px] tracking-[0.16em] text-brand-dark uppercase">
            CAFE
          </span>
          <span className="font-sans font-medium text-[20px] sm:text-[23px] tracking-[0.16em] text-brand-dark px-0.5">—</span>
          <span className="font-sans font-medium text-[20px] sm:text-[23px] tracking-[0.16em] text-brand-dark uppercase">
            AMULUNG
          </span>
        </div>
      </div>
      {showIcon && iconPosition === 'right' && logoIconMarkup}
    </div>
  );
};


