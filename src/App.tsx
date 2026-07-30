import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Search,
  Coffee,
  Utensils,
  MapPin,
  Clock,
  Info,
  Heart,
  LogOut,
  UserCheck,
  Cake
} from 'lucide-react';
import { MenuItem, CartItem, Order, OrderStatus, CustomerAccount } from './types';
import { MENU_ITEMS } from './data';
import MenuItemCard from './components/MenuItemCard';
import DrinkCustomizerModal from './components/DrinkCustomizerModal';
import MealDetailModal from './components/MealDetailModal';
import CartDrawer from './components/CartDrawer';
import { CafeLogo } from './components/CafeLogo';
import AdminPanel from './components/AdminPanel';
import LoginGateway from './components/LoginGateway';
import CustomerAccountModal from './components/CustomerAccountModal';
import CategorySliderBar from './components/CategorySliderBar';
import {
  db,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from './lib/firebase';

function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as any;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as any;
  }
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(data as Record<string, any>)) {
    const val = (data as Record<string, any>)[key];
    if (val !== undefined) {
      cleaned[key] = sanitizeForFirestore(val);
    }
  }
  return cleaned as T;
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Portal & Role States: Default to 'gateway' login page
  const [userRole, setUserRole] = useState<'gateway' | 'customer' | 'admin'>('gateway');

  // Customer Account State
  const [customerAccount, setCustomerAccount] = useState<CustomerAccount | null>(() => {
    const saved = localStorage.getItem('honey_bakes_customer_account');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing customer account:', e);
      }
    }
    return null;
  });

  const [customerName, setCustomerName] = useState<string>(() => {
    const savedAcct = localStorage.getItem('honey_bakes_customer_account');
    if (savedAcct) {
      try {
        const parsed = JSON.parse(savedAcct);
        if (parsed?.name) return parsed.name;
      } catch (e) {}
    }
    return localStorage.getItem('honey_bakes_customer_name') || '';
  });

  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [accountModalRequired, setAccountModalRequired] = useState<boolean>(false);

  const handleSelectRole = (role: 'customer' | 'admin') => {
    setUserRole(role);
    if (role === 'customer') {
      setCurrentTab('drinks');
      setIsAccountModalOpen(true);
      setAccountModalRequired(false);
    }
  };

  const handleSaveAccount = async (newAccount: CustomerAccount) => {
    setCustomerAccount(newAccount);
    setCustomerName(newAccount.name);
    try {
      localStorage.setItem('honey_bakes_customer_account', JSON.stringify(newAccount));
      localStorage.setItem('honey_bakes_customer_name', newAccount.name);
    } catch (e) {
      console.error('Failed to save customer account', e);
    }

    if (db && newAccount.email) {
      try {
        const custRef = doc(db, 'customers', newAccount.email.toLowerCase());
        await setDoc(custRef, sanitizeForFirestore({
          id: newAccount.id,
          name: newAccount.name,
          email: newAccount.email.toLowerCase(),
          phone: newAccount.phone || null,
          password: newAccount.password || null,
          createdAt: newAccount.createdAt,
          updatedAt: new Date().toISOString()
        }), { merge: true });
      } catch (err) {
        console.warn('Failed to sync customer account to Firestore:', err);
      }
    }

    setIsAccountModalOpen(false);
    setAccountModalRequired(false);
    setCurrentTab('drinks');
  };

  const handleSignOutCustomer = () => {
    setCustomerAccount(null);
    setCustomerName('');
    localStorage.removeItem('honey_bakes_customer_account');
    localStorage.removeItem('honey_bakes_customer_name');
    setIsAccountModalOpen(false);
    setUserRole('gateway');
  };

  // Navigation states: 'drinks' | 'meals' | 'pastries'
  const [currentTab, setCurrentTab] = useState<'drinks' | 'meals' | 'pastries'>('drinks');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart and Detail States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<MenuItem | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [cartDrawerTab, setCartDrawerTab] = useState<'cart' | 'history'>('cart');
  const [showHeartAlert, setShowHeartAlert] = useState<boolean>(false);

  // Admin & Orders States
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Dynamic Menu Items State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const removedIds = new Set(['pistachio-cheesecake', 'honey-signature-cheesecake']);
    const saved = localStorage.getItem('honey_bakes_menu_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter((item: any) => !removedIds.has(item.id));
          const existingIds = new Set(cleaned.map((i: any) => i.id));
          const missingDefaults = MENU_ITEMS.filter(item => !existingIds.has(item.id) && !removedIds.has(item.id));
          if (missingDefaults.length > 0) {
            return [...cleaned, ...missingDefaults];
          }
          return cleaned;
        }
      } catch (e) {
        console.error('Error parsing stored menu items:', e);
      }
    }
    return MENU_ITEMS.filter(item => !removedIds.has(item.id));
  });

  // Subscribe to real-time Firestore menu_items updates so customer and admin are always in sync
  useEffect(() => {
    if (!db) return;
    const menuRef = collection(db, 'menu_items');
    const unsubscribe = onSnapshot(
      menuRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedItems: MenuItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            fetchedItems.push({
              id: docSnap.id,
              name: data.name || '',
              description: data.description || '',
              type: data.type || 'drink',
              category: data.category || 'Signatures',
              prices: data.prices,
              price: data.price,
              availability: data.availability,
              popular: data.popular,
              image: data.image
            } as MenuItem);
          });

          if (fetchedItems.length > 0) {
            setMenuItems(prev => {
              // Merge Firestore items with existing list to keep images & edits intact
              const firestoreMap = new Map(fetchedItems.map(item => [item.id, item]));
              const updatedList = prev.map(localItem => {
                const remoteItem = firestoreMap.get(localItem.id);
                if (!remoteItem) return localItem;
                // Prefer remote image if non-empty, otherwise preserve local image
                const resolvedImage = (remoteItem.image && typeof remoteItem.image === 'string' && remoteItem.image.trim().length > 0)
                  ? remoteItem.image.trim()
                  : (localItem.image && typeof localItem.image === 'string' && localItem.image.trim().length > 0 ? localItem.image.trim() : undefined);
                return {
                  ...localItem,
                  ...remoteItem,
                  image: resolvedImage
                };
              });
              // Also include any newly added items in Firestore not present locally
              fetchedItems.forEach(item => {
                if (!updatedList.some(existing => existing.id === item.id)) {
                  updatedList.push(item);
                }
              });
              return updatedList;
            });
          }
        }
      },
      (error) => {
        console.warn('Firestore menu items listener error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('honey_bakes_menu_items', JSON.stringify(menuItems));
    } catch (e) {
      console.error('Failed to save menuItems to localStorage', e);
    }
  }, [menuItems]);

  const handleUpdateMenuItem = async (updatedItem: MenuItem) => {
    setMenuItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    if (db) {
      try {
        await setDoc(doc(db, 'menu_items', updatedItem.id), sanitizeForFirestore(updatedItem), { merge: true });
      } catch (err) {
        console.error('Failed to update menu item in Firestore:', err);
      }
    }
  };

  const handleAddMenuItem = async (newItem: MenuItem) => {
    setMenuItems(prev => [newItem, ...prev]);
    if (db) {
      try {
        await setDoc(doc(db, 'menu_items', newItem.id), sanitizeForFirestore(newItem));
      } catch (err) {
        console.error('Failed to add menu item to Firestore:', err);
      }
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
    if (db) {
      try {
        await deleteDoc(doc(db, 'menu_items', itemId));
      } catch (err) {
        console.error('Failed to delete menu item from Firestore:', err);
      }
    }
  };

  const handleResetMenu = async () => {
    const defaults = MENU_ITEMS.filter(item => item.id !== 'pistachio-cheesecake' && item.id !== 'honey-signature-cheesecake');
    setMenuItems(defaults);
    localStorage.removeItem('honey_bakes_menu_items');
    if (db) {
      try {
        const batch = writeBatch(db);
        defaults.forEach(item => {
          batch.set(doc(db, 'menu_items', item.id), sanitizeForFirestore(item));
        });
        await batch.commit();
      } catch (err) {
        console.error('Failed to reset menu in Firestore:', err);
      }
    }
  };

  // Subscribe to real-time Firestore orders updates
  useEffect(() => {
    if (!db) return;
    const ordersRef = collection(db, 'orders');
    const mockOrderIds = new Set(['HBC-2941', 'HBC-4832', 'HBC-9103', 'HBC-8012']);
    const unsubscribe = onSnapshot(
      ordersRef,
      (snapshot) => {
        const fetchedOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          if (mockOrderIds.has(docSnap.id)) {
            deleteDoc(doc(db, 'orders', docSnap.id)).catch(() => {});
            return;
          }
          const data = docSnap.data();
          fetchedOrders.push({
            id: docSnap.id,
            customerName: data.customerName || 'Walk-In Customer',
            customerPhone: data.customerPhone || data.phone || '',
            items: data.items || [],
            totalPrice: data.totalPrice || 0,
            status: data.status || 'Pending',
            createdAt: data.createdAt || '',
            orderDate: data.orderDate || new Date().toISOString().split('T')[0],
            serviceType: data.serviceType || 'Pickup',
            address: data.address,
            receiptImage: data.receiptImage,
            paymentVerified: data.paymentVerified || false,
            coordinates: data.coordinates,
            deliveryDistanceKm: data.deliveryDistanceKm,
            deliveryFee: data.deliveryFee
          } as Order);
        });

        // Sort orders by ticket number descending
        fetchedOrders.sort((a, b) => {
          const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
          const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
          return numB - numA;
        });

        setOrders(fetchedOrders);
      },
      (error) => {
        console.error('Error fetching Firestore real-time orders:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Load cart, active order ID, and role from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('honey_bakes_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      const savedActiveOrderId = localStorage.getItem('honey_bakes_active_order_id');
      if (savedActiveOrderId) {
        setActiveOrderId(savedActiveOrderId);
      }

      // Opening the link ALWAYS lands on the Gateway / Login Portal
      setUserRole('gateway');
    } catch (e) {
      console.error('Failed to load storage values on mount', e);
    }
  }, []);

  // Save state properties on changes
  useEffect(() => {
    try {
      localStorage.setItem('honey_bakes_role', userRole);
    } catch (e) {
      console.error('Failed to save userRole to localStorage', e);
    }
  }, [userRole]);

  useEffect(() => {
    try {
      localStorage.setItem('honey_bakes_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('honey_bakes_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      if (activeOrderId) {
        localStorage.setItem('honey_bakes_active_order_id', activeOrderId);
      } else {
        localStorage.removeItem('honey_bakes_active_order_id');
      }
    } catch (e) {
      console.error('Failed to save activeOrderId to localStorage', e);
    }
  }, [activeOrderId]);

  // Dynamically set category to 'All' when tab changes
  useEffect(() => {
    setActiveCategory('All');
  }, [currentTab]);

  // Group and Category Lists
  const drinkCategories = ['All', 'Signatures', 'Classics', 'Non-Coffee'];
  const mealCategories = ['All', 'Mains', 'All Day Breakfast', 'Sandwich', 'Salad and Starter', 'Pasta'];
  const pastryCategories = ['All', 'Cheesecakes', 'Crepe & Specialty Cakes', 'Fresh Pastries'];
  const currentCategories = currentTab === 'drinks' 
    ? drinkCategories 
    : currentTab === 'meals' 
      ? mealCategories 
      : currentTab === 'pastries'
        ? pastryCategories
        : [];

  // Filter items based on active tab, category, and search query
  const filteredItems = menuItems.filter((item) => {
    // Tab match
    const matchesTab = (item.type === 'drink' && currentTab === 'drinks') || 
                       (item.type === 'meal' && currentTab === 'meals') ||
                       (item.type === 'pastry' && currentTab === 'pastries');
    if (!matchesTab) return false;

    // Category match
    if (activeCategory !== 'All' && item.category !== activeCategory) return false;

    // Search Match
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const nameMatch = item.name.toLowerCase().includes(query);
      const descMatch = item.description.toLowerCase().includes(query);
      const catMatch = item.category.toLowerCase().includes(query);
      return nameMatch || descMatch || catMatch;
    }

    return true;
  });

  // Cart manipulation handlers
  const handleAddToCart = (newCartItem: CartItem) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.id === newCartItem.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += newCartItem.quantity;
        return updated;
      } else {
        return [...prevCart, newCartItem];
      }
    });
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your current order summary?')) {
      setCart([]);
    }
  };

  const handleReorderItems = (reorderCartItems: CartItem[]) => {
    setCart(prevCart => {
      let updatedCart = [...prevCart];
      reorderCartItems.forEach(reItem => {
        const existingIdx = updatedCart.findIndex(c => c.id === reItem.id);
        if (existingIdx > -1) {
          updatedCart[existingIdx] = {
            ...updatedCart[existingIdx],
            quantity: updatedCart[existingIdx].quantity + reItem.quantity
          };
        } else {
          updatedCart.push({ ...reItem });
        }
      });
      return updatedCart;
    });

    setIsCartOpen(true);
  };

  // Order placing & POS management handlers
  const handleSubmitOrder = async (
    customerName: string,
    customerPhone: string,
    serviceType: 'Pickup' | 'Delivery',
    address?: string,
    receiptImage?: string,
    coordinates?: { lat: number; lng: number },
    deliveryDistanceKm?: number,
    deliveryFee?: number
  ) => {
    if (cart.length === 0) return;

    const ticketNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `HBC-${ticketNum}`;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = new Date().toISOString().split('T')[0];

    const newOrder: Order = {
      id: orderId,
      customerName: customerName.trim() || 'Walk-In Customer',
      customerPhone: customerPhone.trim() || '',
      items: [...cart],
      totalPrice: totalCartPrice + (deliveryFee || 0),
      status: 'Pending',
      createdAt: timeStr,
      orderDate: todayStr,
      serviceType,
      address,
      receiptImage,
      paymentVerified: false,
      coordinates,
      deliveryDistanceKm,
      deliveryFee
    };

    try {
      const sanitizedOrder = sanitizeForFirestore(newOrder);
      await setDoc(doc(db, 'orders', orderId), sanitizedOrder);
    } catch (err) {
      console.error('Failed to save order to Firestore:', err);
    }

    setOrders(prev => [newOrder, ...prev.filter(o => o.id !== orderId)]);
    setActiveOrderId(orderId);
    setCart([]);
    setIsCartOpen(true);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => 
      prev.map(o => o.id === orderId ? { ...o, status } : o)
    );
    updateDoc(doc(db, 'orders', orderId), { status }).catch(err => {
      console.error('Failed to update order status in Firestore:', err);
    });
  };

  const handleTogglePaymentVerification = (orderId: string) => {
    const target = orders.find(o => o.id === orderId);
    const newVerified = target ? !target.paymentVerified : true;

    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, paymentVerified: newVerified } : o)
    );
    updateDoc(doc(db, 'orders', orderId), { paymentVerified: newVerified }).catch(err => {
      console.error('Failed to update payment verification in Firestore:', err);
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    if (activeOrderId === orderId) {
      setActiveOrderId(null);
    }
    deleteDoc(doc(db, 'orders', orderId)).catch(err => {
      console.error('Failed to delete order in Firestore:', err);
    });
  };

  const handleClearAllOrders = async () => {
    const currentOrders = [...orders];
    setOrders([]);
    setActiveOrderId(null);
    try {
      const batch = writeBatch(db);
      currentOrders.forEach(o => {
        batch.delete(doc(db, 'orders', o.id));
      });
      await batch.commit();
    } catch (err) {
      console.error('Failed to clear orders from Firestore:', err);
    }
  };

  const handleCancelActiveOrder = () => {
    if (activeOrderId) {
      const activeOrderObj = orders.find(o => o.id === activeOrderId);
      if (activeOrderObj && (activeOrderObj.status === 'Pending' || activeOrderObj.status === 'Preparing')) {
        handleUpdateOrderStatus(activeOrderId, 'Cancelled');
      }
    }
    setActiveOrderId(null);
  };

  // Click handler on menu item card
  const handleItemClick = (item: MenuItem) => {
    const latestItem = menuItems.find(i => i.id === item.id) || item;
    if (latestItem.type === 'drink') {
      setSelectedDrink(latestItem);
    } else {
      setSelectedMeal(latestItem);
    }
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cart.reduce((acc, item) => acc + (item.calculatedPrice * item.quantity), 0);

  if (userRole === 'gateway') {
    return <LoginGateway onSelectRole={handleSelectRole} />;
  }

  const isAdminMode = userRole === 'admin';

  return (
    <div className="min-h-screen bg-stone-100/70 py-0 md:py-6 px-0 md:px-6 flex justify-center items-start">
      <div ref={containerRef} className="w-full max-w-7xl bg-stone-50 md:rounded-3xl md:shadow-2xl h-[100dvh] md:h-[calc(100vh-3rem)] flex flex-col overflow-hidden border-0 md:border md:border-stone-200/80 relative">
        
        {isAdminMode ? (
          <AdminPanel
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onTogglePaymentVerification={handleTogglePaymentVerification}
            onDeleteOrder={handleDeleteOrder}
            onClearAllOrders={handleClearAllOrders}
            onClose={() => setUserRole('gateway')}
            menuItems={menuItems}
            onUpdateMenuItem={handleUpdateMenuItem}
            onAddMenuItem={handleAddMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            onResetMenu={handleResetMenu}
          />
        ) : (
          <>
        {/* Cafe Header / Hero Cover */}
        <header className="bg-white border-b border-brand-border pt-4 pb-4 px-4 md:px-8 relative space-y-3 shadow-xs">
          {/* Top Row: Logo + Portal/Favorite Buttons */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <CafeLogo className="mt-0.5 mb-1" />
              <p className="text-xs text-stone-500 font-medium flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" /> Zone 5, Calamagui, Amulung, Cagayan
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Staff Console toggle / Switch Portal / Logout */}
              <button
                id="staff-console-btn"
                onClick={() => setUserRole('gateway')}
                className="p-2.5 bg-brand-dark hover:bg-stone-800 rounded-xl border border-brand-dark text-brand-yellow transition-all active:scale-95 relative cursor-pointer"
                title="Switch Portal / Logout"
              >
                <LogOut className="w-4 h-4" />
                {orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white font-black text-[8px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Badges Row: Open Hours & Customer Account */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick timing alert */}
            <div className="flex items-center gap-1.5 text-[11px] text-brand-deep bg-brand-yellow/20 px-3 py-1.5 rounded-xl border border-brand-border/60 font-semibold">
              <Clock className="w-3.5 h-3.5 text-brand-gold shrink-0" />
              <span>Hours: 9:00 AM – 9:00 PM</span>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border border-emerald-100 ml-1">
                Open Now
              </span>
            </div>

            {/* Customer Account Display Badge */}
            <div className="flex items-center gap-2 bg-brand-cream/40 border border-brand-border/70 rounded-xl px-3 py-1.5 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-brand-gold shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-xs">
                Customer: <strong className="text-brand-dark font-bold">{customerName || 'Guest'}</strong>
                {customerAccount?.email && <span className="text-stone-400 font-normal hidden xl:inline"> ({customerAccount.email})</span>}
              </span>
              <button
                id="customer-account-btn"
                onClick={() => {
                  setAccountModalRequired(false);
                  setIsAccountModalOpen(true);
                }}
                className="text-[10px] font-extrabold text-brand-gold hover:text-brand-accent underline shrink-0 cursor-pointer ml-1"
              >
                {customerAccount?.isLoggedIn ? 'Manage Account' : 'Sign In / Register'}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-3xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              id="menu-search-input"
              type="text"
              placeholder={`Search ${currentTab === 'drinks' ? 'lattes, matchas...' : currentTab === 'meals' ? 'breakfast, sandwich...' : 'cheesecakes, croissants...'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-stone-100/80 border border-stone-200/50 rounded-2xl text-xs focus:outline-none focus:border-brand-gold focus:bg-white text-stone-800 placeholder:text-stone-400 transition-all font-semibold"
            />
            {searchQuery && (
              <button
                id="clear-search-btn"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </header>

        {/* Tab Selection: Drinks vs Meals vs Pastries */}
        <div className="bg-white px-2.5 sm:px-4 pt-3 pb-0.5 border-b border-brand-border/40">
          <div className="flex bg-stone-100 rounded-2xl p-1 border border-stone-200/30 gap-1 overflow-x-auto scrollbar-none touch-pan-x items-center">
            <button
              id="tab-drinks"
              onClick={() => setCurrentTab('drinks')}
              className={`flex-1 shrink-0 px-3 py-2 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentTab === 'drinks'
                  ? 'bg-brand-gold text-white shadow-xs font-extrabold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Coffee className="w-3.5 h-3.5 shrink-0" />
              <span>Drinks</span>
            </button>
            <button
              id="tab-meals"
              onClick={() => setCurrentTab('meals')}
              className={`flex-1 shrink-0 px-3 py-2 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentTab === 'meals'
                  ? 'bg-brand-gold text-white shadow-xs font-extrabold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Utensils className="w-3.5 h-3.5 shrink-0" />
              <span>Meals</span>
            </button>
            <button
              id="tab-pastries"
              onClick={() => setCurrentTab('pastries')}
              className={`flex-1 shrink-0 px-3 py-2 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                currentTab === 'pastries'
                  ? 'bg-brand-gold text-white shadow-xs font-extrabold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Cake className="w-3.5 h-3.5 shrink-0" />
              <span>Bread & Pastries</span>
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Menu Content Body */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 pb-28 space-y-4 sm:space-y-5">
          {/* Quick Notice Banner */}
          <div className="bg-brand-dark text-brand-cream p-4 rounded-3xl flex gap-3 shadow-md">
            <Info className="w-5 h-5 text-brand-yellow flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-yellow">Easy Counter Orders</h4>
              <p className="text-[10.5px] text-brand-cream/80 leading-relaxed">
                Customize your coffee and meals here and build your order dynamically for an efficient counter checkout experience!
              </p>
            </div>
          </div>

          {/* Interactive Category Slider Bar */}
          <CategorySliderBar
            categories={currentCategories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />

          {/* Primary Menu Grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center pl-1">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                {activeCategory} {currentTab === 'pastries' ? 'Bread & Pastries' : currentTab}
              </h3>
              <span className="text-[11px] text-stone-400 font-medium">
                {filteredItems.length} Item{filteredItems.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-brand-border/50 space-y-2">
                <p className="text-sm font-bold text-stone-800">No matching items found</p>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Try adjusting your search query or switching to another category.
                </p>
                <button
                  id="reset-search-categories"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                  }}
                  className="mt-2 text-xs font-bold text-brand-accent underline hover:text-brand-deep"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
                {filteredItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onSelect={handleItemClick}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Favorite Heart Alert Toast */}
        <AnimatePresence>
          {showHeartAlert && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 bg-brand-deep text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg z-50 border border-brand-gold flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-brand-yellow text-brand-yellow" />
              <span>Added Honey Bakes to your Favorites!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 
          Sticky Bottom Floating Counter Check Out Button.
        */}
        {!isAdminMode && (
          <motion.div 
            id="floating-cart-button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            drag
            dragConstraints={containerRef}
            dragMomentum={false}
            dragElastic={0.1}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onTap={() => {
              setCartDrawerTab('cart');
              setIsCartOpen(true);
            }}
            className="fixed md:absolute bottom-6 right-6 z-40 pointer-events-auto flex items-center justify-center bg-brand-dark hover:bg-stone-900 text-white w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl border-2 border-brand-gold cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex flex-col items-center justify-center w-full h-full relative pointer-events-none">
              <ShoppingBag className="w-5.5 h-5.5 text-brand-yellow" />
              <span 
                className={`absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-black w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-brand-dark transition-all duration-300 ${
                  totalCartItems > 0 ? 'scale-100 opacity-100 animate-bounce' : 'scale-0 opacity-0'
                }`}
              >
                {totalCartItems}
              </span>
            </div>
          </motion.div>
        )}

        {/* Drink Customization Panel Modal */}
        <DrinkCustomizerModal
          item={selectedDrink}
          isOpen={selectedDrink !== null}
          onClose={() => setSelectedDrink(null)}
          onAddToCart={handleAddToCart}
        />

        {/* Meal Detail Modal */}
        <MealDetailModal
          item={selectedMeal}
          isOpen={selectedMeal !== null}
          onClose={() => setSelectedMeal(null)}
          onAddToCart={handleAddToCart}
        />

        {/* Sliding Counter Order Pass Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onSubmitOrder={handleSubmitOrder}
          activeOrder={orders.find(o => o.id === activeOrderId) || null}
          onCancelActiveOrder={handleCancelActiveOrder}
          customerName={customerName}
          orders={orders}
          customerAccount={customerAccount}
          onReorderItems={handleReorderItems}
          onSwitchToMenu={(tab) => setCurrentTab(tab)}
          initialTab={cartDrawerTab}
        />

        {/* Customer Account Registration & Sign In Modal */}
        <CustomerAccountModal
          isOpen={isAccountModalOpen}
          onClose={() => {
            setIsAccountModalOpen(false);
            setAccountModalRequired(false);
          }}
          currentAccount={customerAccount}
          onSaveAccount={handleSaveAccount}
          onSignOut={handleSignOutCustomer}
          forceRequired={accountModalRequired}
        />
          </>
        )}

      </div>
    </div>
  );
}
