import { MenuItem, UpgradeOption, ExtraOption } from './types';

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
    price: 249
  },
  {
    id: 'katsu-curry',
    name: 'Katsu Curry',
    type: 'meal',
    category: 'Mains',
    description: 'Crispy, panko-breaded pork cutlet served alongside rich, deeply aromatic Japanese curry sauce over fluffy rice.',
    price: 289,
    popular: true
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
