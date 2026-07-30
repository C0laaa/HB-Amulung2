import { MenuItem, UpgradeOption, ExtraOption } from './types';

const GYUDON_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="%23fafaf9"/>
      <stop offset="100%" stop-color="%23f5f5f4"/>
    </radialGradient>
    <radialGradient id="bowlShadow" cx="50%" cy="55%" r="48%">
      <stop offset="70%" stop-color="%23000000" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="%23000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="yolkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23fbbf24"/>
      <stop offset="60%" stop-color="%23f59e0b"/>
      <stop offset="100%" stop-color="%23d97706"/>
    </linearGradient>
    <linearGradient id="beefGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%2378350f"/>
      <stop offset="50%" stop-color="%23451a03"/>
      <stop offset="100%" stop-color="%2327272a"/>
    </linearGradient>
    <linearGradient id="garlicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23fde68a"/>
      <stop offset="100%" stop-color="%23d97706"/>
    </linearGradient>
  </defs>
  <rect width="500" height="500" fill="url(%23bg)"/>
  <ellipse cx="250" cy="265" rx="190" ry="170" fill="url(%23bowlShadow)"/>
  <circle cx="250" cy="250" r="180" fill="%23e7e5e4" stroke="%23d6d3d1" stroke-width="6"/>
  <circle cx="250" cy="250" r="168" fill="%2378716c"/>
  <circle cx="250" cy="250" r="162" fill="%2357534e"/>
  <circle cx="250" cy="250" r="158" fill="%23fafaf9"/>
  <path d="M 110 210 Q 120 370 260 395 Q 120 380 110 210 Z" fill="%23ffffff"/>
  <ellipse cx="190" cy="290" rx="75" ry="65" fill="%23f8fafc"/>
  <circle cx="160" cy="260" r="4" fill="%23f1f5f9"/>
  <circle cx="175" cy="280" r="5" fill="%23f1f5f9"/>
  <circle cx="145" cy="300" r="4" fill="%23f1f5f9"/>
  <circle cx="200" cy="320" r="5" fill="%23f1f5f9"/>
  <path d="M 180 115 C 280 100 390 160 395 260 C 400 310 330 360 270 350 C 230 340 220 280 230 220 C 240 160 180 115 180 115 Z" fill="url(%23beefGrad)"/>
  <path d="M 210 135 Q 280 150 340 130" stroke="%2392400e" stroke-width="8" stroke-linecap="round" fill="none"/>
  <path d="M 230 165 Q 310 180 375 180" stroke="%23b45309" stroke-width="10" stroke-linecap="round" fill="none"/>
  <path d="M 240 205 Q 330 220 385 220" stroke="%2378350f" stroke-width="12" stroke-linecap="round" fill="none"/>
  <path d="M 250 250 Q 320 270 370 280" stroke="%23451a03" stroke-width="10" stroke-linecap="round" fill="none"/>
  <path d="M 260 290 Q 300 320 340 330" stroke="%2392400e" stroke-width="9" stroke-linecap="round" fill="none"/>
  <path d="M 220 140 Q 260 130 300 155" stroke="%23fef3c7" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.85"/>
  <path d="M 260 175 Q 300 190 350 170" stroke="%23fef3c7" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.85"/>
  <path d="M 280 225 Q 320 240 365 230" stroke="%23fde68a" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.8"/>
  <ellipse cx="310" cy="160" rx="10" ry="6" fill="url(%23garlicGrad)"/>
  <ellipse cx="340" cy="195" rx="12" ry="7" stroke="%23b45309" stroke-width="1" fill="url(%23garlicGrad)"/>
  <ellipse cx="290" cy="210" rx="11" ry="6" fill="url(%23garlicGrad)"/>
  <ellipse cx="330" cy="250" rx="9" ry="5" fill="url(%23garlicGrad)"/>
  <path d="M 120 215 C 105 270 120 350 190 370 C 250 385 270 330 255 285 C 240 240 180 195 120 215 Z" fill="%23ffffff" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"/>
  <path d="M 130 230 C 115 275 130 340 185 355 C 235 370 250 325 240 285 C 230 245 180 210 130 230 Z" fill="%23fefefe"/>
  <circle cx="190" cy="290" r="38" fill="url(%23yolkGrad)" filter="drop-shadow(0px 3px 6px rgba(180,83,9,0.3))"/>
  <ellipse cx="178" cy="276" rx="12" ry="7" fill="%23ffffff" opacity="0.6" transform="rotate(-20 178 276)"/>
  <ellipse cx="280" cy="190" rx="12" ry="6" fill="none" stroke="%2316a34a" stroke-width="3" transform="rotate(-15 280 190)"/>
  <ellipse cx="285" cy="186" rx="8" ry="4" fill="none" stroke="%2322c55e" stroke-width="2" transform="rotate(-15 285 186)"/>
  <ellipse cx="295" cy="205" rx="10" ry="5" fill="none" stroke="%2315803d" stroke-width="3" transform="rotate(20 295 205)"/>
  <ellipse cx="270" cy="215" rx="9" ry="4" fill="none" stroke="%2322c55e" stroke-width="2.5" transform="rotate(-30 270 215)"/>
</svg>`;

const KATSU_CURRY_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <radialGradient id="tableBg" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="%23fafaf9"/>
      <stop offset="70%" stop-color="%23f5f5f4"/>
      <stop offset="100%" stop-color="%23e7e5e4"/>
    </radialGradient>
    <radialGradient id="bowlShadow" cx="50%" cy="55%" r="48%">
      <stop offset="65%" stop-color="%231c1917" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="%231c1917" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="currySauceGrad" x1="10%" y1="10%" x2="90%" y2="90%">
      <stop offset="0%" stop-color="%2378350f"/>
      <stop offset="45%" stop-color="%23653818"/>
      <stop offset="80%" stop-color="%23451a03"/>
      <stop offset="100%" stop-color="%23271202"/>
    </linearGradient>
    <linearGradient id="katsuGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23f59e0b"/>
      <stop offset="35%" stop-color="%23d97706"/>
      <stop offset="70%" stop-color="%23b45309"/>
      <stop offset="100%" stop-color="%2378350f"/>
    </linearGradient>
    <linearGradient id="carrotGlaze" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23fb923c"/>
      <stop offset="100%" stop-color="%23c2410c"/>
    </linearGradient>
    <linearGradient id="potatoGlaze" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23fef08a"/>
      <stop offset="100%" stop-color="%23ca8a04"/>
    </linearGradient>
    <linearGradient id="scallionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%2386efac"/>
      <stop offset="100%" stop-color="%2315803d"/>
    </linearGradient>
  </defs>
  <!-- White Marble Countertop Background -->
  <rect width="600" height="600" fill="url(%23tableBg)"/>
  <path d="M 50 100 Q 200 150 350 80" stroke="%23e7e5e4" stroke-width="3" fill="none" opacity="0.6"/>
  <path d="M 250 480 Q 400 450 550 520" stroke="%23e7e5e4" stroke-width="4" fill="none" opacity="0.5"/>

  <!-- Bowl Shadow -->
  <ellipse cx="300" cy="320" rx="230" ry="200" fill="url(%23bowlShadow)"/>

  <!-- Off-White Ceramic Shallow Bowl -->
  <circle cx="300" cy="300" r="220" fill="%23e7e5e4" stroke="%23d6d3d1" stroke-width="4"/>
  <circle cx="300" cy="300" r="212" fill="%23f5f4f0"/>
  <circle cx="300" cy="300" r="202" fill="%23fcfbf9"/>

  <!-- White Rice Mound (Right Side) -->
  <path d="M 270 120 C 390 110 490 190 490 300 C 490 395 400 480 270 470 C 330 420 350 300 270 120 Z" fill="%23ffffff" filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.05))"/>
  <ellipse cx="380" cy="300" rx="80" ry="120" fill="%23fafafa"/>
  <!-- Individual Rice Grains texture -->
  <circle cx="410" cy="220" r="3.5" fill="%23f1f5f9"/>
  <circle cx="430" cy="250" r="4" fill="%23e2e8f0"/>
  <circle cx="390" cy="280" r="4.5" fill="%23f1f5f9"/>
  <circle cx="420" cy="320" r="4" fill="%23e2e8f0"/>
  <circle cx="370" cy="360" r="3.5" fill="%23f1f5f9"/>
  <circle cx="410" cy="390" r="4" fill="%23e2e8f0"/>
  <circle cx="340" cy="240" r="4" fill="%23f1f5f9"/>
  <circle cx="350" cy="400" r="3.5" fill="%23e2e8f0"/>

  <!-- Sliced Crispy Panko Katsu Cutlet (Middle-Left) -->
  <g filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.15))">
    <!-- Slice 1 (Top) -->
    <path d="M 130 200 L 330 170 L 350 205 L 140 235 Z" fill="url(%23katsuGold)" stroke="%2378350f" stroke-width="2.5"/>
    <!-- Slice 2 -->
    <path d="M 125 230 L 340 200 L 360 240 L 130 270 Z" fill="url(%23katsuGold)" stroke="%2378350f" stroke-width="2.5"/>
    <!-- Slice 3 (Middle) -->
    <path d="M 130 265 L 350 235 L 370 280 L 135 310 Z" fill="url(%23katsuGold)" stroke="%2378350f" stroke-width="2.5"/>
    <!-- Slice 4 -->
    <path d="M 140 305 L 355 275 L 370 320 L 150 350 Z" fill="url(%23katsuGold)" stroke="%2378350f" stroke-width="2.5"/>
    <!-- Slice 5 (Bottom) -->
    <path d="M 160 345 L 345 315 L 355 355 L 180 380 Z" fill="url(%23katsuGold)" stroke="%2378350f" stroke-width="2.5"/>
  </g>

  <!-- Panko Crust Crumbs Highlights -->
  <circle cx="150" cy="215" r="3.5" fill="%23fef08a"/>
  <circle cx="210" cy="195" r="3" fill="%23fef08a"/>
  <circle cx="280" cy="185" r="3.5" fill="%23fef08a"/>
  <circle cx="160" cy="250" r="3" fill="%23fef08a"/>
  <circle cx="290" cy="225" r="3.5" fill="%23fef08a"/>
  <circle cx="170" cy="285" r="3" fill="%23fef08a"/>
  <circle cx="310" cy="260" r="3.5" fill="%23fef08a"/>
  <circle cx="180" cy="325" r="3" fill="%23fef08a"/>
  <circle cx="300" cy="300" r="3.5" fill="%23fef08a"/>

  <!-- Glossy Savory Japanese Curry Sauce Layer (Draped down the center & left) -->
  <path d="M 115 220 C 130 150 230 140 320 155 C 350 200 330 260 350 310 C 370 360 310 430 240 430 C 170 425 110 340 115 220 Z" fill="url(%23currySauceGrad)" filter="drop-shadow(0px 6px 12px rgba(39,18,2,0.4))"/>

  <!-- Glossy Curry Highlights & Sheen -->
  <path d="M 140 180 C 190 165 270 170 300 185" stroke="%23b45309" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.6"/>
  <path d="M 130 230 C 150 280 165 340 210 395" stroke="%23b45309" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.5"/>
  <path d="M 160 210 C 200 200 240 220 260 240" stroke="%23fde047" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.4"/>

  <!-- Diced Carrot & Potato Cubes in Sauce -->
  <g filter="drop-shadow(0px 3px 5px rgba(0,0,0,0.3))">
    <!-- Diced Carrots -->
    <rect x="250" y="210" width="26" height="24" rx="6" fill="url(%23carrotGlaze)" transform="rotate(15 250 210)"/>
    <rect x="195" y="280" width="28" height="26" rx="7" fill="url(%23carrotGlaze)" transform="rotate(-18 195 280)"/>
    <!-- Diced Potatoes -->
    <rect x="205" y="225" width="30" height="28" rx="8" fill="url(%23potatoGlaze)" transform="rotate(-10 205 225)"/>
    <rect x="260" y="260" width="32" height="30" rx="8" fill="url(%23potatoGlaze)" transform="rotate(22 260 260)"/>
  </g>

  <!-- Coiled Fresh Scallion / Spring Onion Ribbon (Garnish on top) -->
  <g filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.25))">
    <path d="M 235 210 C 242 180 260 175 252 205 C 245 230 265 235 272 210" fill="none" stroke="url(%23scallionGrad)" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M 242 213 C 248 186 262 181 256 207" fill="none" stroke="%2386efac" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="265" cy="230" rx="10" ry="5" fill="none" stroke="%2316a34a" stroke-width="3.5" transform="rotate(-25 265 230)"/>
  </g>
</svg>`;

export const UPGRADES: UpgradeOption[] = [
  { name: 'Oat Milk', price: 50 },
  { name: 'Almond Milk', price: 50 },
  { name: 'Soy Milk', price: 45 },
];

export const EXTRAS: ExtraOption[] = [
  { name: 'Flavored Syrup', price: 15 },
  { name: 'Caramel / Chocolate Sauce', price: 20 },
  { name: 'Whipped Cream', price: 25 },
  { name: 'Espresso Shot', price: 40 },
  { name: 'Sea Salt Cream', price: 30 },
  { name: 'Cold Foam', price: 30 },
];

export const MENU_ITEMS: MenuItem[] = [
  // ==================== DRINKS ====================
  // --- Signatures ---
  {
    id: 'honey-sig-latte',
    name: 'Honey’s Signature Latte',
    type: 'drink',
    category: 'Signatures',
    description: 'Our award-winning signature espresso blended with natural premium wild honey, smooth milk, and a delicate sweet finish.',
    availability: 'Iced Only',
    prices: { small: 150, medium: 175 },
    popular: true
  },
  {
    id: 'honey-cloud-latte',
    name: 'Honey’s Cloud Latte',
    type: 'drink',
    category: 'Signatures',
    description: 'Velvety espresso covered with a rich, fluffy, aerated honey-infused cold foam. An airy delight.',
    availability: 'Iced Only',
    prices: { small: 155, medium: 175 },
    popular: true
  },
  {
    id: 'palm-oat-latte',
    name: 'Palm Oat Latte',
    type: 'drink',
    category: 'Signatures',
    description: 'A comforting, earth-friendly combination of robust espresso, rich coconut palm nectar, and creamy oat milk.',
    availability: 'Hot / Iced',
    prices: { medium: 180 },
    popular: true
  },
  {
    id: 'strawberry-cream-matcha',
    name: 'Strawberry Cream Matcha',
    type: 'drink',
    category: 'Signatures',
    description: 'Layered perfection of organic Japanese Uji Matcha, sweet milk, and a luxurious house-made strawberry cream foam.',
    availability: 'Iced Only',
    prices: { medium: 200 },
    popular: true
  },
  {
    id: 'iced-shaken-macchiato',
    name: 'Iced Shaken Macchiato',
    type: 'drink',
    category: 'Signatures',
    description: 'Double espresso shaken with organic brown sugar and ice, topped with a silky layer of milk.',
    availability: 'Iced Only',
    prices: { medium: 160 }
  },
  {
    id: 'biscoff-cloud',
    name: 'Biscoff Cloud',
    type: 'drink',
    category: 'Signatures',
    description: 'Decadent coffee blended with authentic caramelized Biscoff cookie butter, topped with a fluffy cream cloud and cookie crumbles.',
    availability: 'Iced',
    prices: { medium: 220 },
    popular: true
  },
  {
    id: 'salted-cocoa-latte',
    name: 'Salted Cocoa Latte',
    type: 'drink',
    category: 'Signatures',
    description: 'A warm, decadent fusion of rich, dark cocoa and bold espresso, balanced with a pinch of sea salt.',
    availability: 'Hot',
    prices: { medium: 180 }
  },

  // --- Classics ---
  {
    id: 'americano',
    name: 'Americano',
    type: 'drink',
    category: 'Classics',
    description: 'Rich, full-bodied espresso shots combined with perfectly tempered hot water or served over ice.',
    availability: 'Hot / Iced',
    prices: { small: 100, medium: 120 }
  },
  {
    id: 'classic-latte',
    name: 'Classic Latte',
    type: 'drink',
    category: 'Classics',
    description: 'Our house espresso pulled perfectly, combined with velvety steamed milk and topped with a delicate layer of microfoam.',
    availability: 'Hot / Iced',
    prices: { small: 140, medium: 160 }
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    type: 'drink',
    category: 'Classics',
    description: 'An expert balance of equal parts intense espresso, velvety steamed milk, and heavy, luxurious dry foam.',
    availability: 'Hot Only',
    prices: { small: 130, medium: 150 }
  },
  {
    id: 'vanilla-latte',
    name: 'Vanilla Latte',
    type: 'drink',
    category: 'Classics',
    description: 'Our classic latte elevated with the sweet, smooth infusion of premium Madagascar vanilla bean extract.',
    availability: 'Hot / Iced',
    prices: { small: 155, medium: 170 }
  },
  {
    id: 'hazelnut-latte',
    name: 'Hazelnut Latte',
    type: 'drink',
    category: 'Classics',
    description: 'Rich, nutty roasted hazelnut syrup swirled together with our classic espresso and velvety steamed milk.',
    availability: 'Hot / Iced',
    prices: { small: 155, medium: 170 }
  },
  {
    id: 'spanish-latte',
    name: 'Spanish Latte',
    type: 'drink',
    category: 'Classics',
    description: 'A creamy espresso latte sweetened with highly decadent, rich condensed milk.',
    availability: 'Hot / Iced',
    prices: { small: 145, medium: 165 }
  },
  {
    id: 'caramel-macchiato',
    name: 'Caramel Macchiato',
    type: 'drink',
    category: 'Classics',
    description: 'Fresh steamed milk stained with bold espresso, marked with a beautiful, sweet caramel drizzle grid.',
    availability: 'Hot / Iced',
    prices: { small: 150, medium: 170 }
  },
  {
    id: 'mocha',
    name: 'Mocha',
    type: 'drink',
    category: 'Classics',
    description: 'Rich espresso poured over premium dark chocolate, blended with steamed milk for the ultimate coffee-cocoa treat.',
    availability: 'Hot / Iced',
    prices: { small: 145, medium: 165 }
  },
  {
    id: 'white-mocha',
    name: 'White Chocolate Mocha',
    type: 'drink',
    category: 'Classics',
    description: 'Sweet white chocolate sauce combined with fresh espresso and creamy milk, topped with a light foam.',
    availability: 'Hot / Iced',
    prices: { small: 145, medium: 165 }
  },
  {
    id: 'classic-cold-foam',
    name: 'Classic Cold Foam',
    type: 'drink',
    category: 'Classics',
    description: 'Chilled sweet espresso poured under a heavy, velvety, slow-pouring blanket of whipped cold milk foam.',
    availability: 'Iced Only',
    prices: { small: 135, medium: 155 }
  },
  {
    id: 'orange-espresso',
    name: 'Orange Espresso',
    type: 'drink',
    category: 'Classics',
    description: 'A sparkling and citrusy double shot of intense espresso poured over iced 100% natural orange juice.',
    availability: 'Iced Only',
    prices: { medium: 155 }
  },
  {
    id: 'flat-white',
    name: 'Flat White',
    type: 'drink',
    category: 'Classics',
    description: 'Double shot of rich espresso topped with steam-stretched whole milk for a velvety, dense microfoam texture.',
    availability: 'Hot',
    prices: { small: 135 }
  },

  // --- Non-Coffee ---
  {
    id: 'dark-chocolate',
    name: 'Dark Chocolate',
    type: 'drink',
    category: 'Non-Coffee',
    description: 'Indulgent, premium artisan dark cocoa melted and whipped with creamy milk.',
    availability: 'Hot / Iced',
    prices: { small: 135, medium: 165 }
  },
  {
    id: 'matcha-latte',
    name: 'Matcha Latte',
    type: 'drink',
    category: 'Non-Coffee',
    description: 'Authentic stone-ground Japanese Uji matcha whisked to perfection and served with rich, silky milk.',
    availability: 'Hot / Iced',
    prices: { small: 145, medium: 175 }
  },
  {
    id: 'peachy-delight',
    name: 'Peachy Delight',
    type: 'drink',
    category: 'Non-Coffee',
    description: 'An extremely refreshing, crisp peach infusion served iced with real fruit pieces and botanicals.',
    availability: 'Iced Only',
    prices: { medium: 155 }
  },
  {
    id: 'white-velvet',
    name: 'White Velvet',
    type: 'drink',
    category: 'Non-Coffee',
    description: 'Rich white chocolate and sweet milk whipped together in an ice-cold luxurious shake.',
    availability: 'Iced Only',
    prices: { medium: 145 }
  },
  {
    id: 'purple-lemonade',
    name: 'Purple Lemonade',
    type: 'drink',
    category: 'Non-Coffee',
    description: 'A magical, color-changing iced beverage featuring zesty organic lemon and beautiful butterfly pea flower extract.',
    availability: 'Iced Only',
    prices: { medium: 140 }
  },
  {
    id: 'berry-pink',
    name: 'Berry Pink',
    type: 'drink',
    category: 'Non-Coffee',
    description: 'A sweet, fruity iced blend of natural red berries and creamy, rich milk, topped with a gorgeous pink foam.',
    availability: 'Iced Only',
    prices: { medium: 175 }
  },

  // ==================== MEALS ====================
  // --- Mains ---
  {
    id: 'wagyu-kimchi-rice',
    name: 'Wagyu & Kimchi Rice',
    type: 'meal',
    category: 'Mains',
    description: 'Juicy, premium Wagyu beef slices pan-seared and served over a bed of spicy, savory house kimchi fried rice, crowned with a perfect sunny-side up egg.',
    price: 299,
    popular: true
  },
  {
    id: 'braised-adobo-belly',
    name: 'Braised Adobo Belly',
    type: 'meal',
    category: 'Mains',
    description: 'Mouth-watering, extra tender slow-braised pork belly cooked in our signature Filipino garlic soy-vinegar reduction.',
    price: 259
  },
  {
    id: 'beef-salpicao',
    name: 'Beef Salpicao',
    type: 'meal',
    category: 'Mains',
    description: 'Sautéed beef tenderloin cubes cooked in massive amounts of butter, toasted garlic, and premium dark soy sauce.',
    price: 259
  },
  {
    id: 'chicken-teriyaki',
    name: 'Chicken Teriyaki',
    type: 'meal',
    category: 'Mains',
    description: 'Crispy pan-fried chicken thighs glazed with a glossy sweet-savory house teriyaki sauce, served over steaming white rice.',
    price: 259
  },
  {
    id: 'salisbury-meatballs',
    name: 'Salisbury Meatballs',
    type: 'meal',
    category: 'Mains',
    description: 'Juicy beef and pork meatballs smothered in rich, velvety garlic mushroom gravy, served with fluffy jasmine rice.',
    price: 285
  },
  {
    id: 'gyudon',
    name: 'Gyudon',
    type: 'meal',
    category: 'Mains',
    description: 'Classic Japanese beef bowl featuring thinly sliced beef and sweet caramelized onions simmered in dashi, soy sauce, and mirin.',
    price: 249,
    image: GYUDON_IMAGE
  },
  {
    id: 'katsu-curry',
    name: 'Katsu Curry',
    type: 'meal',
    category: 'Mains',
    description: 'Crispy, panko-breaded pork cutlet served alongside rich, deeply aromatic Japanese curry sauce over fluffy rice.',
    price: 289,
    popular: true,
    image: KATSU_CURRY_IMAGE
  },
  {
    id: 'garlic-shrimp',
    name: 'Garlic Shrimp',
    type: 'meal',
    category: 'Mains',
    description: 'Plump, succulent shrimps sautéed in a rich garlic butter and white wine reduction with custom herbs.',
    price: 299
  },
  {
    id: 'katsudon',
    name: 'Katsudon',
    type: 'meal',
    category: 'Mains',
    description: 'A warm bowl of rice topped with a crispy pork cutlet, sweet onions, and a soft, fluffy scrambled egg simmered in savory broth.',
    price: 269
  },
  {
    id: 'caramelized-spam',
    name: 'Caramelized Spam',
    type: 'meal',
    category: 'Mains',
    description: 'Glazed, caramelized premium thick Spam slices served with hot garlic fried rice and a perfectly cooked fried egg.',
    price: 189
  },

  // --- All Day Breakfast ---
  {
    id: 'brunch-tapa',
    name: 'Brunch Tapa',
    type: 'meal',
    category: 'All Day Breakfast',
    description: 'Our house-cured sweet and savory beef tapa, served with a sunny-side egg and delicious garlic sinangag rice.',
    price: 239,
    popular: true
  },
  {
    id: 'bacon-tocino',
    name: 'Bacon Tocino',
    type: 'meal',
    category: 'All Day Breakfast',
    description: 'Pork belly tocino slices cured in sweet fruit sugars, cooked until nicely caramelized. Served with egg and fried rice.',
    price: 229
  },

  // --- Sandwich ---
  {
    id: 'egg-drop-sandwich',
    name: 'Egg Drop Sandwich',
    type: 'meal',
    category: 'Sandwich',
    description: 'Korean-style sandwich with super fluffy scrambled eggs, premium melted cheese, and sweet sriracha mayo on toasted brioche bread.',
    price: 189,
    popular: true
  },
  {
    id: 'hb-club-sandwich',
    name: 'HB Club Sandwich',
    type: 'meal',
    category: 'Sandwich',
    description: 'Three layers of toasted white bread stuffed with grilled chicken, crisp smoked bacon, fresh lettuce, tomatoes, and egg salad.',
    price: 280
  },
  {
    id: 'katsu-sandwich',
    name: 'Katsu Sandwich',
    type: 'meal',
    category: 'Sandwich',
    description: 'Thick, extra crunchy panko pork cutlet slathered in sweet katsu sauce and pressed inside soft, crustless Japanese shokupan bread.',
    price: 269
  },
  {
    id: 'hb-banh-mi',
    name: 'HB Banh Mi',
    type: 'meal',
    category: 'Sandwich',
    description: 'Fresh, crispy baguette filled with savory roasted pork, pâté, pickled daikon radish, fresh cilantro, and sweet hoisin sauce.',
    price: 289
  },

  // --- Salad and Starter ---
  {
    id: 'umami-fries',
    name: 'Umami Fries',
    type: 'meal',
    category: 'Salad and Starter',
    description: 'Crisp golden shoe-string potato fries tossed in savory seaweed nori dust and premium white truffle salt.',
    price: 215
  },
  {
    id: 'ceasar-salad',
    name: 'Caesar Salad',
    type: 'meal',
    category: 'Salad and Starter',
    description: 'Crisp romaine lettuce tossed in rich, creamy Caesar dressing, loaded with buttery garlic croutons and grated Parmesan cheese.',
    price: 250
  },

  // --- Pasta ---
  {
    id: 'truffle-cream-pasta',
    name: 'Truffle Cream Pasta',
    type: 'meal',
    category: 'Pasta',
    description: 'Al dente spaghetti tossed in a rich, buttery heavy cream sauce infused with genuine Italian black truffle paste.',
    price: 190,
    popular: true
  },
  {
    id: 'spaghetti-meatballs',
    name: 'Spaghetti & Meatballs',
    type: 'meal',
    category: 'Pasta',
    description: 'Classic, slow-simmered rich red tomato sauce and heavy homemade beef and pork meatballs over a bed of perfect spaghetti.',
    price: 190
  },
  {
    id: 'creamy-shrimp-rose-pasta',
    name: 'Creamy Shrimp Rose Pasta',
    type: 'meal',
    category: 'Pasta',
    description: 'Plump garlic shrimp folded into a delicate pink sauce blending fresh tomatoes and thick dairy cream.',
    price: 279
  },

  // --- Bread & Pastries ---
  {
    id: 'biscoff-cheesecake',
    name: 'Biscoff Cheesecake',
    type: 'pastry',
    category: 'Cheesecakes',
    description: 'Rich, creamy cheesecake infused with caramelized Lotus Biscoff cookie spread and crushed Biscoff cookie crust. (₱175 / slice)',
    price: 175,
    popular: true
  },
  {
    id: 'honeys-dream-cake',
    name: 'Honey\'s Dream Cake',
    type: 'pastry',
    category: 'Crepe & Specialty Cakes',
    description: 'Decadent multi-layered chocolate dream cake topped with smooth chocolate ganache and cocoa dusting. (₱175 / slice)',
    price: 175,
    popular: true
  },
  {
    id: 'tiramisu-crepe-cake',
    name: 'Tiramisu Crepe Cake',
    type: 'pastry',
    category: 'Crepe & Specialty Cakes',
    description: 'Paper-thin delicate crepe layers stacked with espresso-soaked mascarpone cream and dark cocoa. (₱175 / slice)',
    price: 175,
    popular: true
  },
  {
    id: 'burnt-chocolate-cheesecake',
    name: 'Burnt Chocolate Cheesecake',
    type: 'pastry',
    category: 'Cheesecakes',
    description: 'Basque-style caramelized burnt top cheesecake blended with Belgian dark chocolate. (₱175 / slice)',
    price: 175
  },
  {
    id: 'salted-caramel-crepe-cake',
    name: 'Salted Caramel Crepe Cake',
    type: 'pastry',
    category: 'Crepe & Specialty Cakes',
    description: 'Delicate crepe layers with homemade buttery salted caramel drizzled between fluffy whipped cream. (₱175 / slice)',
    price: 175
  },
  {
    id: 'pain-au-chocolat',
    name: 'Pain au Chocolat',
    type: 'pastry',
    category: 'Fresh Pastries',
    description: 'Flaky, buttery French puff pastry wrapped around rich dark chocolate batons.',
    price: 105,
    popular: true
  },
  {
    id: 'croissant',
    name: 'Croissant',
    type: 'pastry',
    category: 'Fresh Pastries',
    description: 'Golden, extra flaky French butter croissant freshly baked daily with golden crust.',
    price: 105,
    popular: true
  }
];
