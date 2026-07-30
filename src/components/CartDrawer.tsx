import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  CreditCard, 
  Sparkles, 
  User, 
  AlertCircle, 
  Copy, 
  Check,
  Clock,
  CheckCircle2,
  RefreshCw,
  XCircle,
  Upload,
  Image as ImageIcon,
  MapPin,
  Truck,
  Phone,
  Flag,
  AlertTriangle,
  MapPinOff,
  ShieldAlert,
  History
} from 'lucide-react';
import { CartItem, Order, CustomerAccount } from '../types';
import PreviousOrdersView from './PreviousOrdersView';

export const ALLOWED_DELIVERY_BARANGAYS = [
  "Calamagui",
  "Estefania",
  "Conception",
  "Anquiray",
  "Centro",
  "Baculud"
];

// Matching aliases & spelling variants for the 6 allowed delivery barangays
const ALLOWED_DELIVERY_MATCHES = [
  { name: "Calamagui", keys: ["calamagui"] },
  { name: "Estefania", keys: ["estefania", "estephania"] },
  { name: "Conception", keys: ["conception", "concepcion"] },
  { name: "Anquiray", keys: ["anquiray"] },
  { name: "Centro", keys: ["centro"] },
  { name: "Baculud", keys: ["baculud", "baculod"] }
];

/**
 * Checks if a typed location is inside the 6 allowed delivery barangays in Amulung, Cagayan.
 * Automatically flags any location outside these 6 barangays.
 */
export const checkAmulungLocationStatus = (inputAddr: string): {
  isFlagged: boolean;
  reason?: string;
  matchedBarangay?: string;
} => {
  const addr = inputAddr.toLowerCase().trim();
  if (!addr || addr.length < 2) {
    return { isFlagged: false };
  }

  // Check if address contains one of the 6 allowed delivery barangays / variants
  const matched = ALLOWED_DELIVERY_MATCHES.find(item =>
    item.keys.some(k => addr.includes(k))
  );

  if (matched) {
    return {
      isFlagged: false,
      matchedBarangay: `Brgy. ${matched.name}`
    };
  }

  // Automatically flag any other typed location
  return {
    isFlagged: true,
    reason: `Delivery is strictly available for Estefania, Conception, Anquiray, Centro, Baculud, and Calamagui only.`
  };
};

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onSubmitOrder: (
    customerName: string,
    customerPhone: string,
    serviceType: 'Pickup' | 'Delivery',
    address?: string,
    receiptImage?: string,
    coordinates?: { lat: number; lng: number },
    deliveryDistanceKm?: number,
    deliveryFee?: number
  ) => void;
  activeOrder: Order | null;
  onCancelActiveOrder: () => void;
  customerName?: string;
  orders?: Order[];
  customerAccount?: CustomerAccount | null;
  onReorderItems?: (items: CartItem[]) => void;
  onSwitchToMenu?: (tab: 'drinks' | 'meals' | 'pastries') => void;
  initialTab?: 'cart' | 'history';
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSubmitOrder,
  activeOrder,
  onCancelActiveOrder,
  customerName: initialCustomerName,
  orders = [],
  customerAccount = null,
  onReorderItems,
  onSwitchToMenu,
  initialTab = 'cart'
}: CartDrawerProps) {
  const [activeDrawerTab, setActiveDrawerTab] = useState<'cart' | 'history'>(initialTab);
  const [customerName, setCustomerName] = useState<string>(initialCustomerName || '');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [serviceType, setServiceType] = useState<'Pickup' | 'Delivery'>('Pickup');
  const [address, setAddress] = useState<string>('');
  const [distanceKm, setDistanceKm] = useState<number>(1);
  const [autoDetectedLocation, setAutoDetectedLocation] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setActiveDrawerTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (initialCustomerName) {
      setCustomerName(initialCustomerName);
    }
  }, [initialCustomerName]);

  // Helper function to estimate distance in KM based on address keywords
  const estimateDistanceKmFromAddress = (inputAddress: string): { km: number; matchedLandmark?: string } => {
    const addr = inputAddress.toLowerCase().trim();
    if (!addr) return { km: 1 };

    // 1. Check for explicit "Xkm" or "X km" typed by the user
    const explicitKmMatch = addr.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometers?|kilometro)/i);
    if (explicitKmMatch) {
      const parsed = Math.round(parseFloat(explicitKmMatch[1]));
      if (parsed >= 1) {
        return { km: Math.min(30, parsed), matchedLandmark: `${parsed} km explicit input` };
      }
    }

    // 2. Keyword & Barangay auto-detection relative to Zone 5, Calamagui, Amulung Cagayan base
    const barangayRules: { keywords: string[]; km: number; label: string }[] = [
      { keywords: ['calamagui', 'zone 5', 'zone 1', 'zone 2', 'zone 3', 'zone 4', 'zone 6', 'zone 7', 'store', 'cafe'], km: 1, label: 'Brgy. Calamagui (Zone 5 Base)' },
      { keywords: ['estefania', 'estephania'], km: 2, label: 'Brgy. Estefania' },
      { keywords: ['conception', 'concepcion'], km: 3, label: 'Brgy. Conception' },
      { keywords: ['anquiray', 'anquirai'], km: 4, label: 'Brgy. Anquiray' },
      { keywords: ['centro', 'poblacion'], km: 5, label: 'Brgy. Centro' },
      { keywords: ['baculud', 'baculod'], km: 6, label: 'Brgy. Baculud' },
      // Other surrounding Amulung outer areas fallback
      { keywords: ['dugayung', 'gabut'], km: 3, label: 'Dugayung / Gabut' },
      { keywords: ['nabbabalacan', 'agguirit', 'bayabat'], km: 7, label: 'Outer Amulung (7km)' },
      { keywords: ['iguig', 'alcala'], km: 10, label: 'Amulung Border (10km)' }
    ];

    for (const rule of barangayRules) {
      if (rule.keywords.some(kw => addr.includes(kw))) {
        return { km: rule.km, matchedLandmark: rule.label };
      }
    }

    return { km: 1 };
  };

  // Handler for address change that automatically calculates km
  const handleAddressChange = (newAddr: string) => {
    setAddress(newAddr);
    const { km, matchedLandmark } = estimateDistanceKmFromAddress(newAddr);
    setDistanceKm(km);
    setAutoDetectedLocation(matchedLandmark || null);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const itemsTotal = cart.reduce((acc, item) => acc + (item.calculatedPrice * item.quantity), 0);

  // Standard delivery rate starting from Zone 5, Calamagui, Amulung: ₱60 base (1 km) + ₱10 per additional km
  const deliveryFee = serviceType === 'Delivery' ? 60 + Math.max(0, distanceKm - 1) * 10 : 0;
  const grandTotal = itemsTotal + deliveryFee;

  const handleCopyOrderText = () => {
    if (cart.length === 0) return;
    
    let orderSummaryText = `☕ Honey Bakes Cafe Order\n`;
    if (customerName.trim()) {
      orderSummaryText += `Name: ${customerName.trim()}\n`;
    }
    orderSummaryText += `Service Option: ${serviceType}\n`;
    if (serviceType === 'Delivery' && address.trim()) {
      orderSummaryText += `Address: ${address.trim()}\n`;
    }
    orderSummaryText += `--------------------------\n`;
    
    cart.forEach(item => {
      orderSummaryText += `${item.quantity}x ${item.menuItem.name}`;
      if (item.customization) {
        orderSummaryText += ` (${item.customization.temperature} - ${item.customization.size})`;
        if (item.customization.upgrades.length > 0) {
          orderSummaryText += `\n   + Milk Upgrade: ${item.customization.upgrades.join(', ')}`;
        }
        if (item.customization.extras.length > 0) {
          orderSummaryText += `\n   + Extras: ${item.customization.extras.join(', ')}`;
        }
      }
      orderSummaryText += `\n   ₱${item.calculatedPrice * item.quantity}\n\n`;
    });
    
    orderSummaryText += `--------------------------\n`;
    orderSummaryText += `Total Price: ₱${grandTotal}\n`;
    orderSummaryText += `Generated at: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Manila Time`;

    navigator.clipboard.writeText(orderSummaryText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [isCopiedGcash, setIsCopiedGcash] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
            setReceiptImage(compressedDataUrl);
          }
        };
        img.onerror = () => {
          // Fallback if canvas compression fails
          if (typeof event.target?.result === 'string') {
            setReceiptImage(event.target.result);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyGcash = () => {
    navigator.clipboard.writeText('09053564009');
    setIsCopiedGcash(true);
    setTimeout(() => setIsCopiedGcash(false), 2000);
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

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-stone-50 shadow-2xl z-50 flex flex-col h-full border-l border-brand-border"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-brand-border bg-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-brand-gold" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-brand-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {totalItems}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="font-sans text-base sm:text-lg font-bold text-brand-dark">Honey Bakes Pass</h2>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Checkout & Order History</p>
                </div>
              </div>
              <button
                id="close-cart-drawer"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Switcher: Current Cart vs Past Orders */}
            <div className="bg-white px-4 py-2 border-b border-brand-border/40 shrink-0">
              <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200/50 gap-1">
                <button
                  id="drawer-tab-cart"
                  onClick={() => setActiveDrawerTab('cart')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeDrawerTab === 'cart'
                      ? 'bg-brand-gold text-white shadow-xs font-extrabold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span>Current Cart</span>
                  {totalItems > 0 && (
                    <span className="bg-white text-brand-gold text-[10px] font-black px-1.5 py-0.2 rounded-full border border-stone-200 shrink-0">
                      {totalItems}
                    </span>
                  )}
                </button>
                <button
                  id="drawer-tab-history"
                  onClick={() => setActiveDrawerTab('history')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeDrawerTab === 'history'
                      ? 'bg-brand-gold text-white shadow-xs font-extrabold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <History className="w-3.5 h-3.5 shrink-0" />
                  <span>Past Orders</span>
                  {orders && orders.length > 0 && (
                    <span className="bg-white text-brand-gold text-[10px] font-black px-1.5 py-0.2 rounded-full border border-stone-200 shrink-0">
                      {orders.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {activeDrawerTab === 'history' ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
                <PreviousOrdersView
                  orders={orders}
                  customerAccount={customerAccount}
                  customerName={customerName}
                  onReorderItems={(items) => {
                    if (onReorderItems) {
                      onReorderItems(items);
                    }
                    setActiveDrawerTab('cart');
                  }}
                  onSwitchTab={(tab) => {
                    if (onSwitchToMenu) {
                      onSwitchToMenu(tab);
                    }
                    onClose();
                  }}
                />
              </div>
            ) : (
              /* Cart Content */
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {cart.length === 0 ? (
                activeOrder ? (
                  /* Live Active Order Status Tracker */
                  <div className="h-full flex flex-col justify-between py-2 space-y-6">
                    <div className="space-y-5">
                      {/* Live Status Header Card */}
                      <div className="bg-white rounded-3xl border border-brand-border p-5 shadow-xs text-center relative overflow-hidden">
                        {/* Status top highlight */}
                        <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                          activeOrder.status === 'Pending' ? 'bg-amber-500 animate-pulse' :
                          activeOrder.status === 'Preparing' ? 'bg-blue-500' :
                          activeOrder.status === 'Completed' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />
                        
                        <div className="space-y-1 mt-2">
                          <span className="text-[9px] font-black tracking-widest bg-brand-yellow text-brand-accent px-2.5 py-1 rounded-full uppercase border border-brand-border/40">
                            Live Order Tracking
                          </span>
                          <h3 className="font-sans text-xl font-black text-brand-dark mt-3">Ticket #{activeOrder.id}</h3>
                          <p className="text-[10px] text-stone-400 font-bold tracking-wider">Placed at {activeOrder.createdAt}</p>
                        </div>

                        {/* Progress Bar / Indicator */}
                        <div className="py-4 space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider px-1">
                            <span className={activeOrder.status === 'Pending' ? 'text-amber-600 font-black' : 'text-stone-400'}>Pending</span>
                            <span className={activeOrder.status === 'Preparing' ? 'text-blue-600 font-black' : 'text-stone-400'}>Preparing</span>
                            <span className={activeOrder.status === 'Completed' ? 'text-emerald-600 font-black' : 'text-stone-400'}>Ready!</span>
                          </div>
                          
                          {/* Visual line */}
                          <div className="h-2 bg-stone-100 rounded-full relative overflow-hidden border border-stone-200/40">
                            <div 
                              className={`h-full transition-all duration-700 ${
                                activeOrder.status === 'Pending' ? 'w-[15%] bg-amber-500' :
                                activeOrder.status === 'Preparing' ? 'w-2/3 bg-blue-500' :
                                activeOrder.status === 'Completed' ? 'w-full bg-emerald-500' : 'w-full bg-rose-500'
                              }`} 
                            />
                          </div>

                          {/* Dynamic detailed description badge */}
                          <div className="text-xs bg-stone-50 p-3.5 rounded-xl border border-stone-200/50 mt-2 font-semibold">
                            {activeOrder.status === 'Pending' && (
                              <p className="text-amber-800 flex items-center justify-center gap-1.5 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Order submitted! Show to cashier to confirm payment...
                              </p>
                            )}
                            {activeOrder.status === 'Preparing' && (
                              <p className="text-blue-800 flex items-center justify-center gap-1.5 leading-relaxed">
                                <span className="w-2 h-2 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                                Our barista is crafting your customized orders now...
                              </p>
                            )}
                            {activeOrder.status === 'Completed' && (
                              <p className="text-emerald-800 flex items-center justify-center gap-1.5 font-bold leading-relaxed">
                                <Sparkles className="w-3.5 h-3.5 text-brand-gold fill-brand-gold animate-bounce" />
                                Ready for Counter Pickup! Enjoy your treats! 🎉
                              </p>
                            )}
                            {activeOrder.status === 'Cancelled' && (
                              <p className="text-rose-800 flex items-center justify-center gap-1.5 leading-relaxed">
                                This order ticket was cancelled.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Customer indicator */}
                        <div className="border-t border-stone-100 pt-3 text-left space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Customer</span>
                              <p className="text-xs font-bold text-brand-dark mt-0.5">
                                {activeOrder.customerName || 'Counter Customer / Walk-In'}
                              </p>
                              {activeOrder.customerPhone && (
                                <p className="text-[11px] font-bold text-brand-accent flex items-center gap-1 mt-0.5 font-mono">
                                  <Phone className="w-3 h-3 text-brand-gold shrink-0" />
                                  {activeOrder.customerPhone}
                                </p>
                              )}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 border ${
                              activeOrder.serviceType === 'Delivery' 
                                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                : 'bg-stone-100 text-stone-700 border-stone-200'
                            }`}>
                              {activeOrder.serviceType === 'Delivery' ? '🛵 Delivery' : '🏪 Pickup'}
                            </span>
                          </div>
                          {activeOrder.serviceType === 'Delivery' && activeOrder.address && (
                            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                              <span className="text-[8px] text-stone-400 font-bold uppercase tracking-widest block">Delivery Destination</span>
                              <p className="text-[10px] text-stone-600 font-semibold mt-0.5 leading-relaxed">{activeOrder.address}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items details block */}
                      <div className="bg-white rounded-2xl border border-brand-border/60 p-4.5 space-y-3">
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Ordered Items</span>
                        <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                          {activeOrder.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-baseline text-xs pb-1.5 border-b border-stone-50 last:border-0 last:pb-0">
                              <span className="font-bold text-stone-700 leading-tight">
                                {item.quantity}x {item.menuItem.name}
                              </span>
                              <span className="font-mono text-stone-500 font-semibold">₱{item.calculatedPrice * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-2.5 border-t border-stone-100 text-xs font-bold">
                          <span className="text-stone-600">Total Price Paid/Due:</span>
                          <span className="font-mono text-sm font-black text-brand-accent">₱{activeOrder.totalPrice}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tracker control buttons */}
                    <div className="space-y-2 pt-4">
                      {activeOrder.status === 'Pending' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this order?')) {
                              onCancelActiveOrder();
                            }
                          }}
                          className="w-full py-2.5 bg-white hover:bg-rose-50 text-stone-500 hover:text-rose-600 border border-stone-200 hover:border-rose-200 font-bold rounded-xl text-xs transition-all cursor-pointer text-center"
                        >
                          Cancel Order
                        </button>
                      )}

                      {(activeOrder.status === 'Completed' || activeOrder.status === 'Cancelled') && (
                        <button
                          onClick={onCancelActiveOrder}
                          className="w-full py-3 bg-brand-gold hover:bg-brand-accent text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all shadow-md shadow-brand-gold/10 text-center cursor-pointer"
                        >
                          Place Another Order
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Default empty state */
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-brand-cream border border-brand-border flex items-center justify-center text-brand-gold">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="font-sans text-lg font-bold text-brand-dark">Your Cart is Empty</h3>
                      <p className="text-xs text-stone-500 max-w-xs mt-1.5 leading-relaxed">
                        Browse our signature drinks and delicious meals to start customizing your order.
                      </p>
                    </div>
                    <button
                      id="cart-back-to-menu"
                      onClick={onClose}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-accent text-white font-bold text-xs tracking-wider uppercase transition-all"
                    >
                      Browse Menu
                    </button>
                  </div>
                )
              ) : (
                <>
                  {/* Customer Identification */}
                  <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-sm space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-accent flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-brand-gold" />
                          Customer Name <span className="text-red-500">*</span>
                        </span>
                        <span className="text-[10px] text-stone-400 font-semibold">Required</span>
                      </label>
                      <input
                        id="customer-name-input"
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder=""
                        className="w-full px-3.5 py-2.5 bg-brand-light border border-brand-border/60 rounded-xl text-sm focus:outline-none focus:border-brand-gold focus:bg-white text-brand-dark placeholder:text-stone-400 font-semibold transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-accent flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-brand-gold" />
                          Contact / Mobile Number <span className="text-red-500">*</span>
                        </span>
                        <span className="text-[10px] text-stone-400 font-semibold">For Pickup & Delivery</span>
                      </label>
                      <input
                        id="customer-phone-input"
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder=""
                        className="w-full px-3.5 py-2.5 bg-brand-light border border-brand-border/60 rounded-xl text-sm focus:outline-none focus:border-brand-gold focus:bg-white text-brand-dark placeholder:text-stone-400 font-semibold transition-all font-mono"
                      />
                    </div>

                    {/* Service Type Switch */}
                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      <span className="text-xs font-bold text-brand-accent flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-brand-gold" />
                        Service Preference
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setServiceType('Pickup')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                            serviceType === 'Pickup'
                              ? 'bg-brand-dark text-brand-yellow border-brand-dark shadow-sm'
                              : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100/60'
                          }`}
                        >
                          <span>🏪 Store Pickup</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setServiceType('Delivery')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                            serviceType === 'Delivery'
                              ? 'bg-brand-dark text-brand-yellow border-brand-dark shadow-sm'
                              : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100/60'
                          }`}
                        >
                          <span>🛵 Home Delivery</span>
                        </button>
                      </div>
                    </div>

                    {/* Animated Address Area */}
                    <AnimatePresence initial={false}>
                      {serviceType === 'Delivery' && (() => {
                        const amulungStatus = checkAmulungLocationStatus(address);
                        return (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 pt-2 border-t border-stone-100 overflow-hidden"
                          >
                            {/* Delivery Restriction Warning & Range Notice Banner */}
                            <div className="bg-amber-500/10 border-2 border-amber-500/40 p-3 rounded-2xl space-y-2">
                              <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
                                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                                <span>Allowed Delivery Barangays Only</span>
                              </div>
                              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                                <span className="text-amber-800 shrink-0">⚠️</span>
                                <span><strong>Delivery is strictly available for Estefania, Conception, Anquiray, Centro, Baculud, and Calamagui.</strong></span>
                              </div>
                              <p className="text-[10.5px] text-amber-900 font-medium leading-relaxed">
                                📍 Base Location: <strong className="text-brand-dark font-bold">Zone 5, Calamagui, Amulung, Cagayan</strong>
                              </p>
                              <div className="flex items-center justify-between bg-white/90 p-2 rounded-xl border border-amber-200/60 text-[10.5px] text-amber-950 font-bold">
                                <span>Standard Base Rate (1 km): ₱60</span>
                                <span className="text-brand-accent">+₱10 / additional km</span>
                              </div>
                            </div>

                            {/* Address Textarea */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                                Detailed Delivery Address
                              </label>
                              <textarea
                                required
                                rows={2}
                                value={address}
                                onChange={(e) => handleAddressChange(e.target.value)}
                                placeholder=""
                                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all leading-normal focus:outline-none ${
                                  amulungStatus.isFlagged
                                    ? 'bg-rose-50 border-2 border-rose-400 text-rose-950 focus:border-rose-500 placeholder:text-rose-300'
                                    : 'bg-stone-50 border border-stone-200 focus:border-brand-gold focus:bg-white text-brand-dark placeholder:text-stone-400'
                                }`}
                              />

                              {/* Flagged Location Warning Banner */}
                              {amulungStatus.isFlagged && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.96 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="bg-rose-50 border-2 border-rose-300 p-3 rounded-2xl space-y-1.5 shadow-xs"
                                >
                                  <div className="flex items-center gap-2 text-rose-800 font-black text-xs">
                                    <Flag className="w-4 h-4 text-rose-600 shrink-0 fill-rose-600 animate-pulse" />
                                    <span>FLAGGED: Non-Amulung Delivery Address</span>
                                  </div>
                                  <p className="text-[11px] text-rose-950 font-bold leading-relaxed">
                                    {amulungStatus.reason}
                                  </p>
                                  <div className="p-2 bg-white/95 rounded-xl border border-rose-200 text-[10.5px] text-rose-900 font-bold flex items-center justify-between gap-2">
                                    <span>Pick a valid Amulung barangay above or switch to Pickup.</span>
                                    <button
                                      type="button"
                                      onClick={() => setServiceType('Pickup')}
                                      className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-black hover:bg-rose-700 transition-colors cursor-pointer text-[10px] shrink-0"
                                    >
                                      Switch to Pickup
                                    </button>
                                  </div>
                                </motion.div>
                              )}

                              {/* Verified Amulung Location Auto-detected badge */}
                              {address.trim() && !amulungStatus.isFlagged && (
                                <motion.div
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-emerald-50 border border-emerald-200/80 px-3 py-2 rounded-xl flex items-center justify-between text-[11px]"
                                >
                                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>
                                      {autoDetectedLocation ? (
                                        <>Verified Amulung: <strong className="text-emerald-950 font-black">{autoDetectedLocation}</strong></>
                                      ) : (
                                        <>Verified Amulung Location ({amulungStatus.matchedBarangay || 'Amulung, Cagayan'})</>
                                      )}
                                    </span>
                                  </div>
                                  <span className="font-mono font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300/60">
                                    {distanceKm} km (₱{deliveryFee})
                                  </span>
                                </motion.div>
                              )}
                            </div>

                            {/* Automatic Distance & Delivery Fee Calculation Display */}
                            <div className="space-y-2 pt-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                                  Calculated Delivery Distance
                                </label>
                                <span className="font-mono text-xs font-black text-brand-accent bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                                  {distanceKm} km = ₱{deliveryFee}
                                </span>
                              </div>

                              {/* Automatic Price & KM summary card */}
                              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs">
                                <div className="space-y-0.5">
                                  <span className="text-brand-dark font-extrabold block">
                                    {distanceKm} kilometer{distanceKm > 1 ? 's' : ''} distance
                                  </span>
                                  <p className="text-[10px] text-stone-400 font-medium">
                                    Calculated from Zone 5, Calamagui base
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-black text-emerald-600 block">
                                    ₱{deliveryFee}
                                  </span>
                                  <p className="text-[9.5px] text-stone-400 font-bold">
                                    {distanceKm === 1 ? '₱60 base rate' : `₱60 + ₱${(distanceKm - 1) * 10}`}
                                  </p>
                                </div>
                              </div>

                              {/* Quick Barangay Distance Presets */}
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                                  Popular Barangay Quick Presets:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {[
                                    { label: 'Calamagui (Zone 5)', name: 'Brgy. Calamagui (Zone 5), Amulung, Cagayan', km: 1, fee: 60 },
                                    { label: 'Estefania', name: 'Brgy. Estefania, Amulung, Cagayan', km: 2, fee: 70 },
                                    { label: 'Conception', name: 'Brgy. Conception, Amulung, Cagayan', km: 3, fee: 80 },
                                    { label: 'Anquiray', name: 'Brgy. Anquiray, Amulung, Cagayan', km: 4, fee: 90 },
                                    { label: 'Centro', name: 'Brgy. Centro, Amulung, Cagayan', km: 5, fee: 100 },
                                    { label: 'Baculud', name: 'Brgy. Baculud, Amulung, Cagayan', km: 6, fee: 110 },
                                  ].map((preset) => (
                                    <button
                                      key={preset.label}
                                      type="button"
                                      onClick={() => {
                                        setDistanceKm(preset.km);
                                        setAddress(preset.name);
                                        setAutoDetectedLocation(`Brgy. ${preset.label}`);
                                      }}
                                      className={`text-[9.5px] px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                                        distanceKm === preset.km
                                          ? 'bg-brand-dark text-brand-yellow border border-brand-dark shadow-xs'
                                          : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
                                      }`}
                                    >
                                      {preset.label} • {preset.km}km (₱{preset.fee})
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>
                  </div>

                  {/* GCash Payment Mode */}
                  <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-sm space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-accent flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-brand-gold" />
                        GCash Mobile Payment
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                        Official Payment
                      </span>
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl space-y-1.5">
                      <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Send GCash Payment to:</p>
                      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-blue-100/60">
                        <span className="font-mono text-sm font-black text-blue-900">0905 356 4009</span>
                        <button
                          type="button"
                          onClick={handleCopyGcash}
                          className="p-1 text-xs text-blue-600 hover:text-blue-800 transition-colors font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {isCopiedGcash ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-[10px] text-emerald-600 font-black">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="text-[10px]">Copy No.</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[9.5px] text-stone-500 leading-relaxed font-semibold">
                        Please send your payment of <span className="text-brand-dark font-black font-mono">₱{grandTotal}</span> exactly to the GCash number above, then upload your proof of payment receipt image below.
                      </p>
                    </div>

                    {/* Receipt Image Upload */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                        Proof of Payment Receipt <span className="text-red-500">*</span>
                      </span>

                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {receiptImage ? (
                        <div className="relative rounded-xl border border-stone-200 overflow-hidden bg-stone-50 p-2.5 flex items-center gap-3">
                          <img
                            src={receiptImage}
                            alt="GCash Receipt"
                            referrerPolicy="no-referrer"
                            className="w-12 h-16 object-cover rounded-md border border-stone-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-brand-dark truncate">receipt_uploaded.png</p>
                            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">✅ Receipt Attached</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReceiptImage('')}
                            className="p-1 text-stone-400 hover:text-red-500 transition-colors cursor-pointer text-xs font-bold bg-white rounded-lg border border-stone-200 hover:border-red-200 shadow-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-stone-200 hover:border-brand-gold rounded-xl p-4 text-center bg-stone-50 hover:bg-white transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 active:scale-[0.99]"
                        >
                          <Upload className="w-5 h-5 text-stone-400" />
                          <div>
                            <span className="text-xs font-bold text-brand-dark">Click to upload Receipt Image</span>
                            <span className="text-[10px] text-stone-400 block font-medium mt-0.5">Supports PNG, JPG (Max 5MB)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Selected Items</h3>
                      <button
                        id="clear-cart"
                        onClick={onClearCart}
                        className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear All
                      </button>
                    </div>

                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white p-4 rounded-2xl border border-brand-border/60 shadow-xs flex gap-3 relative overflow-hidden"
                        >
                          {/* Accent bar for drinks or meals */}
                          <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${item.menuItem.type === 'drink' ? 'bg-brand-gold' : 'bg-emerald-600'}`} />

                          <div className="flex-1 min-w-0 pl-3">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-bold text-brand-dark text-sm leading-snug truncate">
                                {item.menuItem.name}
                              </h4>
                              <button
                                id={`remove-item-${item.id}`}
                                onClick={() => onRemoveItem(item.id)}
                                className="text-stone-400 hover:text-red-500 transition-colors p-0.5"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Customization labels */}
                            {item.customization ? (
                              <div className="mt-1 space-y-1">
                                <div className="flex flex-wrap gap-1 text-[10px] font-bold">
                                  <span className={`px-1.5 py-0.5 rounded-md ${
                                    item.customization.temperature === 'Hot'
                                      ? 'bg-red-50 text-red-600 border border-red-100'
                                      : 'bg-sky-50 text-sky-600 border border-sky-100'
                                  }`}>
                                    {item.customization.temperature}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                                    {item.customization.size}
                                  </span>
                                </div>

                                {item.customization.upgrades.length > 0 && (
                                  <p className="text-[10px] text-brand-accent font-semibold leading-none">
                                    🥛 Milk: {item.customization.upgrades.join(', ')}
                                  </p>
                                )}
                                {item.customization.extras.length > 0 && (
                                  <p className="text-[10px] text-stone-500 font-semibold leading-none">
                                    ✨ Add-ons: {item.customization.extras.join(', ')}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-[10px] text-emerald-800 font-semibold mt-1">
                                🍽️ Standard Serving
                              </p>
                            )}

                            {/* Pricing & Quantity Section */}
                            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100">
                              <span className="font-mono text-xs font-bold text-brand-deep">
                                ₱{item.calculatedPrice * item.quantity}
                              </span>

                              {/* Quantity Control within Cart */}
                              <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200/50">
                                <button
                                  id={`cart-decrement-${item.id}`}
                                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                  className="w-6 h-6 rounded-md flex items-center justify-center text-stone-500 font-extrabold hover:bg-white transition-all text-sm"
                                >
                                  −
                                </button>
                                <span className="w-6 text-center font-mono font-bold text-stone-800 text-xs">
                                  {item.quantity}
                                </span>
                                <button
                                  id={`cart-increment-${item.id}`}
                                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                  className="w-6 h-6 rounded-md flex items-center justify-center text-stone-500 font-extrabold hover:bg-white transition-all text-sm"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Copy to clipboard button to easily send or show as text */}
                    <div className="pt-2">
                      <button
                        id="copy-order-text"
                        onClick={handleCopyOrderText}
                        className="w-full py-3 rounded-xl border border-brand-border hover:border-brand-gold bg-white text-brand-dark font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied Order Summary!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-brand-accent" />
                            <span>Copy Order Text to Clipboard</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sticky Order Button at bottom */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-brand-border bg-white">
                {serviceType === 'Delivery' ? (
                  <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/50 mb-4 text-xs space-y-2 font-semibold">
                    <div className="flex justify-between text-stone-500">
                      <span>Items Subtotal:</span>
                      <span className="font-mono">₱{itemsTotal}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>Highway Delivery Fee ({distanceKm} km):</span>
                      <span className="font-mono text-emerald-600">+ ₱{deliveryFee}</span>
                    </div>
                    <div className="border-t border-dashed border-stone-200 pt-2 flex justify-between text-brand-dark font-black text-sm">
                      <span>Total Counter Bill:</span>
                      <span className="font-sans text-brand-gold text-base font-black">₱{grandTotal}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-brand-dark">Total Counter Bill:</span>
                    <span className="font-sans text-2xl font-black text-brand-dark">₱{grandTotal}</span>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {!customerName.trim() && (
                    <p className="text-[10px] text-amber-600 font-bold text-center mb-1 flex items-center justify-center gap-1 bg-amber-50 py-1.5 px-2.5 rounded-lg border border-amber-100">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" /> Customer name is required to proceed.
                    </p>
                  )}
                  {!customerPhone.trim() && (
                    <p className="text-[10px] text-amber-600 font-bold text-center mb-1 flex items-center justify-center gap-1 bg-amber-50 py-1.5 px-2.5 rounded-lg border border-amber-100">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" /> Contact number is required for pickup & delivery alerts.
                    </p>
                  )}
                  {serviceType === 'Delivery' && !address.trim() && (
                    <p className="text-[10px] text-amber-600 font-bold text-center mb-1 flex items-center justify-center gap-1 bg-amber-50 py-1.5 px-2.5 rounded-lg border border-amber-100">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" /> Please enter your delivery address above.
                    </p>
                  )}
                  {serviceType === 'Delivery' && address.trim() && checkAmulungLocationStatus(address).isFlagged && (
                    <p className="text-[10px] text-rose-600 font-extrabold text-center mb-1 flex items-center justify-center gap-1 bg-rose-50 py-1.5 px-2.5 rounded-lg border border-rose-200 shadow-xs">
                      <Flag className="w-3.5 h-3.5 shrink-0 text-rose-600 fill-rose-600 animate-pulse" /> Delivery location is flagged as outside Amulung, Cagayan.
                    </p>
                  )}
                  {!receiptImage && (
                    <p className="text-[10px] text-amber-600 font-bold text-center mb-1 flex items-center justify-center gap-1 bg-amber-50 py-1.5 px-2.5 rounded-lg border border-amber-100">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" /> Proof of payment receipt is required to checkout.
                    </p>
                  )}
                  <button
                    id="submit-order-trigger"
                    disabled={
                      !customerName.trim() ||
                      !customerPhone.trim() || 
                      (serviceType === 'Delivery' && (!address.trim() || checkAmulungLocationStatus(address).isFlagged))
                    }
                    onClick={() => {
                      if (!customerName.trim()) {
                        const inputEl = document.getElementById('customer-name-input');
                        inputEl?.focus();
                        return;
                      }
                      if (!customerPhone.trim()) {
                        const inputEl = document.getElementById('customer-phone-input');
                        inputEl?.focus();
                        return;
                      }
                      if (serviceType === 'Delivery' && checkAmulungLocationStatus(address).isFlagged) {
                        return;
                      }
                      if (!receiptImage) {
                        fileInputRef.current?.click();
                      } else {
                        onSubmitOrder(
                          customerName.trim(),
                          customerPhone.trim(),
                          serviceType,
                          serviceType === 'Delivery' ? address : undefined,
                          receiptImage,
                          undefined,
                          serviceType === 'Delivery' ? distanceKm : undefined,
                          serviceType === 'Delivery' ? deliveryFee : undefined
                        );
                        setReceiptImage(''); // Clear receipt image after submit
                      }
                    }}
                    className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
                      serviceType === 'Delivery' && checkAmulungLocationStatus(address).isFlagged
                        ? 'bg-rose-600 text-white shadow-rose-600/10'
                        : !receiptImage 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10' 
                        : 'bg-brand-gold hover:bg-brand-accent text-white shadow-brand-gold/10'
                    }`}
                  >
                    {serviceType === 'Delivery' && checkAmulungLocationStatus(address).isFlagged ? (
                      <>
                        <Flag className="w-4 h-4 fill-white" />
                        <span>Location Flagged (Outside Amulung)</span>
                      </>
                    ) : !receiptImage ? (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Attach Receipt to Order</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>{serviceType === 'Delivery' ? 'Submit Delivery Order' : 'Submit Pickup Order'}</span>
                      </>
                    )}
                  </button>
                  <button
                    id="close-drawer-btn"
                    onClick={onClose}
                    className="w-full py-2.5 bg-white hover:bg-stone-50 border border-brand-border/60 rounded-xl text-stone-600 font-bold text-xs transition-all cursor-pointer text-center"
                  >
                    Close & Keep Customizing
                  </button>
                </div>
              </div>
            )}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
