export type ItemType = 'drink' | 'meal' | 'pastry';

export interface DrinkCustomization {
  temperature: 'Hot' | 'Iced';
  size: 'Small' | 'Medium';
  upgrades: string[]; // e.g. ["Oat Milk"]
  extras: string[]; // e.g. ["Espresso Shot", "Cold Foam"]
}

export interface MenuItem {
  id: string;
  name: string;
  type: ItemType;
  category: string;
  description: string;
  availability?: 'Hot' | 'Iced' | 'Hot / Iced' | 'Iced Only' | 'Hot Only' | 'Iced' | string;
  // Prices
  price?: number; // For meals or items with a single price
  prices?: {
    small?: number;
    medium?: number;
  };
  image?: string;
  popular?: boolean;
}

export interface CartItem {
  id: string; // Unique instance ID (e.g., itemID + customization hash)
  menuItem: MenuItem;
  quantity: number;
  customization?: DrinkCustomization;
  calculatedPrice: number; // Single item price including custom options
}

export interface UpgradeOption {
  name: string;
  price: number;
}

export interface ExtraOption {
  name: string;
  price: number;
}

export interface CustomerAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  isLoggedIn: boolean;
  createdAt?: string;
}

export type OrderStatus = 'Pending' | 'Preparing' | 'Completed' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  orderDate?: string; // Date string in YYYY-MM-DD format (e.g., '2026-07-26')
  serviceType: 'Pickup' | 'Delivery';
  address?: string; // Optional delivery address
  receiptImage?: string; // GCash receipt image as data URL
  paymentVerified?: boolean; // Admin check to verify if payment came through
  coordinates?: { lat: number; lng: number };
  deliveryDistanceKm?: number;
  deliveryFee?: number;
}

