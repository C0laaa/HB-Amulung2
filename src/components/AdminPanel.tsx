import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Coffee, 
  Utensils, 
  Trash2, 
  Database, 
  ArrowLeft, 
  ChevronLeft,
  Receipt,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  DollarSign,
  ChevronRight,
  ClipboardList,
  Check,
  AlertCircle,
  Eye,
  Plus,
  Edit2,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Tag,
  Layers,
  Sparkle,
  Lock,
  User,
  MapPin,
  Truck,
  Calendar,
  CalendarDays,
  BarChart3,
  CreditCard,
  Phone,
  Key,
  Bell,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Order, OrderStatus, MenuItem, ItemType, AdminNotification } from '../types';
import { LogoIcon } from './CafeLogo';
import AdminDeliveryRouteMap from './AdminDeliveryRouteMap';
import CategorySliderBar from './CategorySliderBar';
import ResetAdminModal from './ResetAdminModal';

interface StatusOption {
  id: OrderStatus | 'All';
  label: string;
  count: number;
}

interface StatusSliderBarProps {
  statuses: StatusOption[];
  activeStatus: OrderStatus | 'All';
  onSelectStatus: (status: OrderStatus | 'All') => void;
}

function StatusSliderBar({
  statuses,
  activeStatus,
  onSelectStatus,
}: StatusSliderBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) {
      setScrollProgress(0);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const progress = Math.max(0, Math.min(1, scrollLeft / maxScroll));
    setScrollProgress(progress);
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < maxScroll - 2);
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [statuses]);

  const handleScrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -160, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    scrollRef.current?.scrollBy({ left: 160, behavior: 'smooth' });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const progress = val / 100;
    setScrollProgress(progress);
    if (scrollRef.current) {
      const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      scrollRef.current.scrollLeft = progress * maxScroll;
    }
  };

  return (
    <div className="bg-white/90 p-2.5 rounded-2xl border border-brand-border/60 shadow-2xs space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
          <ClipboardList className="w-3.5 h-3.5 text-brand-gold" /> Filter Order Status
        </span>
        <span className="text-[10px] font-bold text-stone-400">
          Slide to view options
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={handleScrollLeft}
          disabled={!canScrollLeft}
          className={`p-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
            canScrollLeft
              ? 'bg-stone-50 text-stone-800 border-stone-300 hover:bg-brand-gold hover:text-white hover:border-brand-gold shadow-2xs active:scale-95'
              : 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed opacity-40'
          }`}
          title="Slide Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Badges Track */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-2 overflow-x-auto py-1 scrollbar-none scroll-smooth flex-1 items-center touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {statuses.map((item) => {
            const isActive = activeStatus === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  onSelectStatus(item.id);
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-brand-dark text-white border-brand-dark shadow-sm scale-[1.02]'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200 hover:border-stone-300'
                }`}
              >
                <span>{item.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                  isActive
                    ? 'bg-brand-gold text-white'
                    : 'bg-stone-200 text-stone-700'
                }`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={handleScrollRight}
          disabled={!canScrollRight}
          className={`p-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
            canScrollRight
              ? 'bg-stone-50 text-stone-800 border-stone-300 hover:bg-brand-gold hover:text-white hover:border-brand-gold shadow-2xs active:scale-95'
              : 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed opacity-40'
          }`}
          title="Slide Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Range Slider Bar */}
      {(canScrollLeft || canScrollRight) && (
        <div className="flex items-center gap-2 px-1 pt-0.5">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={scrollProgress * 100}
            onChange={handleSliderChange}
            className="w-full h-1.5 appearance-none cursor-pointer focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

interface AdminPanelProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onTogglePaymentVerification: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onClearAllOrders: () => void;
  onClose: () => void;
  menuItems: MenuItem[];
  onUpdateMenuItem: (updatedItem: MenuItem) => void;
  onAddMenuItem: (newItem: MenuItem) => void;
  onDeleteMenuItem: (itemId: string) => void;
  onResetMenu: () => void;
  adminNotifications?: AdminNotification[];
  onClearNotifications?: () => void;
  isSoundEnabled?: boolean;
  onToggleSound?: () => void;
}

export default function AdminPanel({
  orders,
  onUpdateOrderStatus,
  onTogglePaymentVerification,
  onDeleteOrder,
  onClearAllOrders,
  onClose,
  menuItems,
  onUpdateMenuItem,
  onAddMenuItem,
  onDeleteMenuItem,
  onResetMenu,
  adminNotifications = [],
  onClearNotifications,
  isSoundEnabled = true,
  onToggleSound
}: AdminPanelProps) {
  // Navigation Tabs: 'orders' | 'income' | 'menu'
  const [adminTab, setAdminTab] = useState<'orders' | 'income' | 'menu'>('orders');
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  const todayDateStr = new Date().toISOString().split('T')[0];

  // Helper to extract date key (YYYY-MM-DD) from an order
  const getOrderDateKey = (order: Order): string => {
    if (order.orderDate) return order.orderDate;
    if (order.createdAt && order.createdAt.length >= 10 && order.createdAt.includes('-')) {
      return order.createdAt.split('T')[0];
    }
    return todayDateStr;
  };

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return 'Today';
    if (dateStr === todayDateStr) return `Today (${dateStr})`;
    try {
      const [y, m, d] = dateStr.split('-');
      if (y && m && d) {
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch (e) {}
    return dateStr;
  };

  // Orders Tab Queue Reset & Date Filtering
  const [ordersDateMode, setOrdersDateMode] = useState<'today' | 'all' | 'custom'>('today');
  const [selectedQueueDate, setSelectedQueueDate] = useState<string>(todayDateStr);

  // Admin Credentials Reset Modal State
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

  // Income Panel State
  const [selectedIncomeDate, setSelectedIncomeDate] = useState<string>(todayDateStr);
  const [incomeStatusFilter, setIncomeStatusFilter] = useState<OrderStatus | 'All'>('All');

  // Orders Tab States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);
  const [zoomedReceipt, setZoomedReceipt] = useState<string | null>(null);
  const [zoomedOrder, setZoomedOrder] = useState<Order | null>(null);

  // Menu Tab States
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<string>('All');
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [isAddingNewItem, setIsAddingNewItem] = useState<boolean>(false);

  // Form State for Adding / Editing Menu Item
  const [itemFormData, setItemFormData] = useState<{
    id: string;
    name: string;
    type: ItemType;
    category: string;
    description: string;
    image: string;
    price: number;
    smallPrice: number;
    mediumPrice: number;
    popular: boolean;
  }>({
    id: '',
    name: '',
    type: 'meal',
    category: 'Mains',
    description: '',
    image: '',
    price: 250,
    smallPrice: 120,
    mediumPrice: 140,
    popular: false
  });

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isWarning?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Active Queue Date Target
  const activeQueueDate = ordersDateMode === 'today' ? todayDateStr : (ordersDateMode === 'custom' ? selectedQueueDate : null);

  // Filter orders for the active live ticket queue
  const filteredOrders = orders.filter(order => {
    // Daily queue filter: if mode is today/custom, strictly match the order's date
    const orderDate = getOrderDateKey(order);
    if (activeQueueDate && orderDate !== activeQueueDate) {
      return false;
    }

    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === '' || 
      order.id.toLowerCase().includes(query) || 
      order.customerName.toLowerCase().includes(query) ||
      order.items.some(item => item.menuItem.name.toLowerCase().includes(query));
      
    return matchesStatus && matchesSearch;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Overall Statistics for current active queue view
  const queueOrdersList = activeQueueDate ? orders.filter(o => getOrderDateKey(o) === activeQueueDate) : orders;
  const completedOrders = queueOrdersList.filter(o => o.status === 'Completed');
  const totalSales = completedOrders.reduce((acc, o) => acc + o.totalPrice, 0);
  const activeOrdersCount = queueOrdersList.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
  const totalOrdersCount = queueOrdersList.length;

  // --- DAILY INCOME PANEL CALCULATIONS ---
  // Extract all unique dates present in orders (sorted descending)
  const availableDatesSet = new Set(orders.map(o => getOrderDateKey(o)));
  availableDatesSet.add(todayDateStr);
  const availableDates = Array.from(availableDatesSet)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Orders for the selected income date
  const dayOrders = orders.filter(o => getOrderDateKey(o) === selectedIncomeDate);
  const dayCompletedOrders = dayOrders.filter(o => o.status === 'Completed');
  const dayTotalRevenue = dayCompletedOrders.reduce((acc, o) => acc + o.totalPrice, 0);

  // Drinks vs Meals breakdown for selected day
  let dayDrinksRevenue = 0;
  let dayMealsRevenue = 0;
  let dayTotalItemsCount = 0;

  dayCompletedOrders.forEach(o => {
    o.items.forEach(item => {
      dayTotalItemsCount += item.quantity;
      const itemTotal = item.calculatedPrice * item.quantity;
      if (item.menuItem.type === 'drink') {
        dayDrinksRevenue += itemTotal;
      } else {
        dayMealsRevenue += itemTotal;
      }
    });
  });

  // GCash Verified Payments on selected day
  const dayVerifiedGCashOrders = dayOrders.filter(o => o.paymentVerified);
  const dayVerifiedGCashTotal = dayVerifiedGCashOrders
    .filter(o => o.status === 'Completed')
    .reduce((acc, o) => acc + o.totalPrice, 0);

  // Service Type breakdown on selected day
  const dayPickupOrders = dayOrders.filter(o => o.serviceType === 'Pickup');
  const dayDeliveryOrders = dayOrders.filter(o => o.serviceType === 'Delivery');

  // Filter day's orders for the daily income order list table
  const filteredDayOrders = dayOrders.filter(order => {
    if (incomeStatusFilter !== 'All' && order.status !== incomeStatusFilter) return false;
    return true;
  });

  // Multi-Day History Summary Table
  const dailyHistoryList = availableDates.map(dateKey => {
    const dOrders = orders.filter(o => getOrderDateKey(o) === dateKey);
    const dCompleted = dOrders.filter(o => o.status === 'Completed');
    const dRevenue = dCompleted.reduce((acc, o) => acc + o.totalPrice, 0);
    const dItemsCount = dOrders.reduce((acc, o) => acc + o.items.reduce((iAcc, item) => iAcc + item.quantity, 0), 0);
    return {
      dateKey,
      formattedDate: formatDisplayDate(dateKey),
      totalOrders: dOrders.length,
      completedCount: dCompleted.length,
      revenue: dRevenue,
      itemsCount: dItemsCount
    };
  });

  // Filter menu items
  const defaultCategories = ['All', 'Signatures', 'Classics', 'Non-Coffee', 'Mains', 'All Day Breakfast', 'Sandwich', 'Salad and Starter', 'Pasta', 'Cheesecakes', 'Crepe & Specialty Cakes', 'Fresh Pastries'];
  const activeItemCategories = Array.from(new Set(menuItems.map(i => i.category).filter(Boolean)));
  const menuCategories = ['All', ...Array.from(new Set([...defaultCategories.filter(c => c !== 'All'), ...activeItemCategories]))];

  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = menuCategoryFilter === 'All' || item.category === menuCategoryFilter;
    const query = menuSearchQuery.toLowerCase().trim();
    const matchesSearch = query === '' ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Status Badge Helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
        );
      case 'Preparing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-spin" />
            Preparing
          </span>
        );
      case 'Ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
            <ShoppingBag className="w-3 h-3 text-amber-600" />
            Ready for Pickup
          </span>
        );
      case 'Out for Delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-sky-900 border border-sky-300 uppercase tracking-wider">
            <Truck className="w-3 h-3 text-sky-600 animate-bounce" />
            Rider En Route
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wider">
            <XCircle className="w-3 h-3 text-rose-600" />
            Cancelled
          </span>
        );
    }
  };

  // Open Edit Modal for a Menu Item
  const handleStartEditItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    setIsAddingNewItem(false);
    setItemFormData({
      id: item.id,
      name: item.name,
      type: item.type,
      category: item.category,
      description: item.description,
      image: item.image || '',
      price: item.price || 0,
      smallPrice: item.prices?.small || 120,
      mediumPrice: item.prices?.medium || 140,
      popular: item.popular || false
    });
  };

  // Open Modal to Add New Menu Item
  const handleStartAddItem = () => {
    setIsAddingNewItem(true);
    setEditingMenuItem(null);
    setItemFormData({
      id: 'custom-' + Date.now(),
      name: '',
      type: 'meal',
      category: 'Mains',
      description: '',
      image: '',
      price: 289,
      smallPrice: 130,
      mediumPrice: 150,
      popular: false
    });
  };

  // Handle local image file upload, auto-compress & resize to fit storage & render fast
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result && typeof reader.result === 'string') {
        const rawResult = reader.result;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const maxDim = 600;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.75);
            setItemFormData(prev => ({
              ...prev,
              image: compressed
            }));
          } else {
            setItemFormData(prev => ({
              ...prev,
              image: rawResult
            }));
          }
        };
        img.onerror = () => {
          setItemFormData(prev => ({
            ...prev,
            image: rawResult
          }));
        };
        img.src = rawResult;
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Menu Item Changes
  const handleSaveItemForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormData.name.trim()) return;

    const updatedItem: MenuItem = {
      id: itemFormData.id || 'item-' + Date.now(),
      name: itemFormData.name.trim(),
      type: itemFormData.type,
      category: itemFormData.category.trim() || 'Mains',
      description: itemFormData.description.trim(),
      image: itemFormData.image.trim() || undefined,
      popular: itemFormData.popular,
      ...(itemFormData.type === 'drink'
        ? {
            prices: {
              small: Number(itemFormData.smallPrice) || 120,
              medium: Number(itemFormData.mediumPrice) || 140
            },
            availability: 'Hot / Iced'
          }
        : {
            price: Number(itemFormData.price) || 250
          })
    };

    if (isAddingNewItem) {
      onAddMenuItem(updatedItem);
    } else {
      onUpdateMenuItem(updatedItem);
    }

    setEditingMenuItem(null);
    setIsAddingNewItem(false);
  };

  return (
    <div className="bg-stone-50 flex flex-col h-full w-full overflow-hidden">
      {/* Admin Header */}
      <div className="bg-brand-dark text-white py-4 px-5 flex items-center justify-between shadow-md relative">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-800 text-stone-300 hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Back to Customer Menu"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black tracking-widest bg-brand-gold text-white px-2 py-0.5 rounded-sm uppercase">
                  Staff Console
                </span>
              </div>
              <h1 className="font-sans text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                Honey Bakes Admin — Amulung
              </h1>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/10 p-1 flex items-center justify-center shrink-0 border border-white/10">
              <LogoIcon className="w-7 h-7 text-brand-yellow" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                isSoundEnabled
                  ? 'bg-stone-800 text-amber-400 border-amber-500/30 hover:bg-stone-700'
                  : 'bg-stone-800/60 text-stone-500 border-stone-700 hover:text-stone-300'
              }`}
              title={isSoundEnabled ? 'Sound Chime Enabled' : 'Sound Chime Muted'}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotificationDrawerOpen(prev => !prev)}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-all cursor-pointer border border-stone-700/60 relative"
            title="Order Notifications Log"
          >
            <Bell className="w-4 h-4 text-brand-gold" />
            {adminNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center animate-pulse">
                {adminNotifications.length}
              </span>
            )}
          </button>

          {adminTab === 'orders' && totalOrdersCount > 0 && (
            <button
              onClick={() => {
                setConfirmDialog({
                  title: 'Wipe Database',
                  message: 'Are you sure you want to delete all order records? This operation is permanent.',
                  confirmText: 'Yes, Wipe All',
                  isWarning: true,
                  onConfirm: () => {
                    onClearAllOrders();
                  }
                });
              }}
              className="p-2 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded-xl transition-all cursor-pointer"
              title="Wipe database"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {adminTab === 'menu' && (
            <button
              onClick={() => {
                setConfirmDialog({
                  title: 'Reset Menu to Default',
                  message: 'Are you sure you want to restore the default menu list? Any custom edits or images will be reset.',
                  confirmText: 'Reset Menu',
                  isWarning: true,
                  onConfirm: () => {
                    onResetMenu();
                  }
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Reset default menu"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
              <span>Reset</span>
            </button>
          )}
          {/* Reset Admin Credentials Header Trigger */}
          <button
            onClick={() => setIsResetPasswordModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-stone-700/60"
            title="Reset Admin Password & Username"
          >
            <Key className="w-3.5 h-3.5 text-brand-gold" />
            <span className="hidden sm:inline">Reset Credentials</span>
          </button>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="bg-brand-dark/95 border-b border-stone-800 px-3 sm:px-5 py-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
        <button
          onClick={() => setAdminTab('orders')}
          className={`flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            adminTab === 'orders'
              ? 'bg-brand-gold text-white shadow-sm'
              : 'bg-stone-800/80 text-stone-400 hover:text-stone-200'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5 shrink-0" />
          <span>Live Queue</span>
          <span className="px-1.5 py-0.2 bg-black/20 rounded-full text-[10px]">
            {filteredOrders.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('income')}
          className={`flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            adminTab === 'income'
              ? 'bg-brand-gold text-white shadow-sm'
              : 'bg-stone-800/80 text-stone-400 hover:text-stone-200'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 shrink-0" />
          <span>Daily Income</span>
          <span className="px-1.5 py-0.2 bg-emerald-950/60 text-emerald-300 rounded-full text-[10px] font-mono font-bold">
            ₱{dayTotalRevenue}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('menu')}
          className={`flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            adminTab === 'menu'
              ? 'bg-brand-gold text-white shadow-sm'
              : 'bg-stone-800/80 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Utensils className="w-3.5 h-3.5 shrink-0" />
          <span>Menu</span>
          <span className="px-1.5 py-0.2 bg-black/20 rounded-full text-[10px]">
            {menuItems.length}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-3xl mx-auto w-full">
        {adminTab === 'orders' ? (
          <>
            {/* Kitchen Queue Date Mode Selector */}
            <div className="bg-white rounded-2xl p-3.5 border border-brand-border/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-gold" />
                  <span className="text-[11px] font-black text-brand-dark uppercase tracking-wider">Kitchen Queue Date Filter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Resets Every Day
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                <button
                  onClick={() => setOrdersDateMode('today')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    ordersDateMode === 'today'
                      ? 'bg-brand-dark text-brand-yellow shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Today's Active Queue ({todayDateStr})</span>
                </button>

                <button
                  onClick={() => setOrdersDateMode('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    ordersDateMode === 'all'
                      ? 'bg-brand-dark text-brand-yellow shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All Orders History</span>
                </button>

                <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-200/80 rounded-xl px-2.5 py-1">
                  <span className="text-[10px] font-bold text-stone-500">Pick Date:</span>
                  <input
                    type="date"
                    value={selectedQueueDate}
                    onChange={(e) => {
                      setSelectedQueueDate(e.target.value);
                      setOrdersDateMode('custom');
                    }}
                    className="text-xs font-bold text-stone-800 bg-transparent outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Bento Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Revenue */}
              <div className="bg-white p-3 rounded-2xl border border-brand-border/40 shadow-xs flex flex-col justify-between">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                  {ordersDateMode === 'today' ? 'Today Revenue' : 'Queue Revenue'}
                </span>
                <span className="text-lg sm:text-xl font-black text-[#78350F] mt-1 truncate">₱{totalSales}</span>
                <div className="flex items-center gap-0.5 text-[8.5px] text-emerald-600 font-bold mt-1.5">
                  <TrendingUp className="w-2.5 h-2.5" />
                  <span>{completedOrders.length} Completed</span>
                </div>
              </div>

              {/* Active Orders */}
              <div className="bg-white p-3 rounded-2xl border border-brand-border/40 shadow-xs flex flex-col justify-between">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Active Queue</span>
                <span className="text-lg sm:text-xl font-black text-brand-dark mt-1">{activeOrdersCount}</span>
                <div className="flex items-center gap-0.5 text-[8.5px] text-amber-600 font-bold mt-1.5">
                  <Clock className="w-2.5 h-2.5 animate-pulse" />
                  <span>In progress</span>
                </div>
              </div>

              {/* Total Tickets */}
              <div className="bg-white p-3 rounded-2xl border border-brand-border/40 shadow-xs flex flex-col justify-between">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Queue Tickets</span>
                <span className="text-lg sm:text-xl font-black text-stone-700 mt-1">{totalOrdersCount}</span>
                <div className="flex items-center gap-0.5 text-[8.5px] text-indigo-600 font-bold mt-1.5">
                  <ClipboardList className="w-2.5 h-2.5" />
                  <span>Tickets count</span>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-3">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by customer, ticket, or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-border/60 rounded-xl text-sm focus:outline-none focus:border-brand-gold font-semibold text-brand-dark placeholder:text-stone-400 transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 font-bold text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Filter slider bar */}
              <StatusSliderBar
                statuses={[
                  { id: 'All', label: 'All', count: totalOrdersCount },
                  { id: 'Pending', label: 'Pending', count: queueOrdersList.filter(o => o.status === 'Pending').length },
                  { id: 'Preparing', label: 'Preparing', count: queueOrdersList.filter(o => o.status === 'Preparing').length },
                  { id: 'Ready', label: 'Ready for Pickup', count: queueOrdersList.filter(o => o.status === 'Ready').length },
                  { id: 'Out for Delivery', label: 'Rider En Route', count: queueOrdersList.filter(o => o.status === 'Out for Delivery').length },
                  { id: 'Completed', label: 'Completed', count: queueOrdersList.filter(o => o.status === 'Completed').length },
                  { id: 'Cancelled', label: 'Cancelled', count: queueOrdersList.filter(o => o.status === 'Cancelled').length }
                ]}
                activeStatus={statusFilter}
                onSelectStatus={(status) => setStatusFilter(status)}
              />
            </div>

            {/* Order Cards List */}
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-brand-border/50 p-10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
                    <ClipboardList className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-sans text-base font-bold text-brand-dark">No orders found</h3>
                    <p className="text-xs text-stone-500 mt-1">
                      {searchQuery || statusFilter !== 'All' 
                        ? 'Try clearing search filters' 
                        : 'New customer orders will appear here in real-time'}
                    </p>
                  </div>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setInspectOrder(order)}
                    className="bg-white rounded-3xl border border-brand-border/60 hover:border-brand-gold p-4 shadow-xs hover:shadow-md transition-all space-y-3 relative cursor-pointer group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-brand-gold">{order.id}</span>
                          <span className="text-stone-300">•</span>
                          <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {order.createdAt} • {formatDisplayDate(getOrderDateKey(order))}
                          </span>
                        </div>
                        <h3 className="font-sans text-base font-bold text-brand-dark mt-0.5 group-hover:text-brand-gold transition-colors">
                          {order.customerName}
                        </h3>
                        {order.customerPhone && (
                          <div className="flex items-center gap-1.5 text-xs text-brand-accent font-bold mt-0.5 font-mono">
                            <Phone className="w-3 h-3 text-brand-gold shrink-0" />
                            <a href={`tel:${order.customerPhone}`} onClick={(e) => e.stopPropagation()} className="hover:underline text-brand-dark">
                              {order.customerPhone}
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1.5">
                          {getStatusBadge(order.status)}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectOrder(order);
                            }}
                            className="px-2 py-1 bg-stone-100 hover:bg-brand-gold hover:text-white text-stone-700 font-bold text-[10.5px] rounded-xl transition-all border border-stone-200/80 flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Inspect Order Details"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Details</span>
                          </button>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          order.serviceType === 'Delivery' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {order.serviceType === 'Delivery' ? '🚚 Delivery' : '🛍️ Pickup'}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2 py-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs font-medium">
                          <div className="flex gap-2">
                            <span className="font-bold text-brand-gold">{item.quantity}x</span>
                            <div>
                              <span className="text-stone-800 font-bold">{item.menuItem.name}</span>
                              {item.customization && (
                                <p className="text-[10px] text-stone-500 font-normal">
                                  {item.customization.temperature} • {item.customization.size}
                                  {item.customization.upgrades.length > 0 && ` • ${item.customization.upgrades.join(', ')}`}
                                  {item.customization.extras.length > 0 && ` • ${item.customization.extras.join(', ')}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="font-bold text-stone-700">₱{item.calculatedPrice * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery details if applicable */}
                    {order.serviceType === 'Delivery' && order.address && (
                      <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200/60 text-xs text-stone-600 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-800">Delivery Address</span>
                          {order.coordinates && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                              }}
                              className="text-[10px] font-bold text-brand-gold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" /> Map Route
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] leading-tight text-stone-600">{order.address}</p>
                      </div>
                    )}

                    {/* Footer: Price, Receipt verification, and Actions */}
                    <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold block">TOTAL AMOUNT</span>
                        <span className="text-lg font-black text-brand-dark">₱{order.totalPrice.toFixed(2)}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* GCash Receipt Verification Button */}
                        {order.receiptImage && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomedReceipt(order.receiptImage || null);
                              setZoomedOrder(order);
                            }}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                            title="Verify GCash Payment Receipt"
                          >
                            <Receipt className="w-3.5 h-3.5 text-amber-600" />
                            <span>Verify GCash</span>
                          </button>
                        )}

                        {/* Order Status Controls */}
                        {order.status === 'Completed' ? (
                          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs">
                            <Lock className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Completed (Final)</span>
                          </div>
                        ) : order.status === 'Cancelled' ? (
                          <div className="px-3 py-1.5 bg-rose-50 text-rose-800 border border-rose-300 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs">
                            <Lock className="w-3.5 h-3.5 text-rose-600" />
                            <span>Cancelled</span>
                          </div>
                        ) : (
                          <>
                            {/* Quick One-Click Action Step Buttons */}
                            {order.status === 'Pending' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateOrderStatus(order.id, 'Preparing');
                                }}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Start Preparing</span>
                              </button>
                            )}

                            {order.status === 'Preparing' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateOrderStatus(order.id, order.serviceType === 'Delivery' ? 'Out for Delivery' : 'Ready');
                                }}
                                className={`px-3 py-1.5 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 ${
                                  order.serviceType === 'Delivery'
                                    ? 'bg-sky-600 hover:bg-sky-700'
                                    : 'bg-amber-600 hover:bg-amber-700'
                                }`}
                              >
                                {order.serviceType === 'Delivery' ? (
                                  <>
                                    <Truck className="w-3.5 h-3.5" />
                                    <span>Rider on the Way</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>Ready for Pickup</span>
                                  </>
                                )}
                              </button>
                            )}

                            {(order.status === 'Ready' || order.status === 'Out for Delivery') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateOrderStatus(order.id, 'Completed');
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mark Completed</span>
                              </button>
                            )}

                            {/* Status Select dropdown override */}
                            <select
                              value={order.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                onUpdateOrderStatus(order.id, e.target.value as OrderStatus);
                              }}
                              className="px-2.5 py-1.5 bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:border-brand-gold cursor-pointer"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Preparing">Preparing</option>
                              <option value="Ready">Ready for Pickup</option>
                              <option value="Out for Delivery">Out for Delivery (Rider)</option>
                              <option value="Completed">Mark Completed (Final)</option>
                              <option value="Cancelled">Cancel Order</option>
                            </select>
                          </>
                        )}

                        {/* Delete Order */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDialog({
                              title: 'Delete Order Ticket',
                              message: `Delete ticket ${order.id} for ${order.customerName}?`,
                              confirmText: 'Delete',
                              isWarning: true,
                              onConfirm: () => onDeleteOrder(order.id)
                            });
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                          title="Delete ticket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : adminTab === 'income' ? (
          /* Daily Income & Revenue Panel */
          <div className="space-y-6">
            {/* Top Control Bar with Date Selector */}
            <div className="bg-white rounded-3xl border border-brand-border/60 p-4 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <h2 className="font-sans text-base font-black text-brand-dark">
                      Daily Income & Sales Analytics
                    </h2>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Track daily revenue, item breakdowns, GCash payments, and daily history
                  </p>
                </div>

                {/* Date Picker Input */}
                <div className="flex items-center gap-2 self-start sm:self-auto bg-stone-50 border border-brand-border/60 p-2 rounded-2xl shadow-2xs">
                  <CalendarDays className="w-4 h-4 text-brand-gold ml-1 shrink-0" />
                  <input
                    type="date"
                    value={selectedIncomeDate}
                    onChange={(e) => setSelectedIncomeDate(e.target.value)}
                    className="text-xs font-bold text-stone-800 bg-transparent outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Quick Date Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">Quick Select:</span>
                <button
                  onClick={() => setSelectedIncomeDate(todayDateStr)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedIncomeDate === todayDateStr
                      ? 'bg-brand-gold text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Today ({todayDateStr})
                </button>

                {availableDates.filter(d => d !== todayDateStr).slice(0, 5).map(dateKey => (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedIncomeDate(dateKey)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedIncomeDate === dateKey
                        ? 'bg-brand-gold text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {formatDisplayDate(dateKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Daily Income Card Only */}
            <div className="bg-gradient-to-br from-emerald-900 via-emerald-900 to-emerald-950 text-white p-5 sm:p-6 rounded-3xl shadow-md border border-emerald-800/50 relative overflow-hidden flex flex-col justify-between gap-3">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider block">
                    Total Daily Income ({formatDisplayDate(selectedIncomeDate)})
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight truncate">
                    ₱{Math.round(dayTotalRevenue)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-emerald-200 bg-emerald-950/80 px-3 py-1.5 rounded-2xl border border-emerald-800/70 flex items-center gap-1.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    {dayCompletedOrders.length} Completed {dayCompletedOrders.length === 1 ? 'Order' : 'Orders'}
                  </span>
                  <span className="text-xs font-bold text-emerald-300/90 bg-emerald-950/40 px-3 py-1.5 rounded-2xl border border-emerald-800/40 shrink-0">
                    {dayOrders.length} Total Tickets
                  </span>
                </div>
              </div>

              <DollarSign className="absolute -right-3 -bottom-3 w-28 h-28 text-emerald-500/10 pointer-events-none" />
            </div>

            {/* Day Orders List Table */}
            <div className="bg-white rounded-3xl border border-brand-border/60 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-sans text-sm sm:text-base font-extrabold text-brand-dark flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-brand-gold" />
                    <span>Orders Recorded on {formatDisplayDate(selectedIncomeDate)}</span>
                  </h3>
                  <p className="text-[11px] text-stone-500">Every order placed on this selected date</p>
                </div>

                {/* Status Filter for Selected Day */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                  {(['All', 'Completed', 'Pending', 'Preparing', 'Cancelled'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setIncomeStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                        incomeStatusFilter === st
                          ? 'bg-brand-dark text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredDayOrders.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 space-y-2">
                  <Calendar className="w-8 h-8 text-stone-300 mx-auto" />
                  <p className="text-xs font-bold text-stone-600">No orders recorded on {selectedIncomeDate}</p>
                  <p className="text-[11px] text-stone-400">Select another date above to view income logs</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredDayOrders.map(order => (
                    <div
                      key={order.id}
                      onClick={() => setInspectOrder(order)}
                      className="p-3.5 bg-stone-50 hover:bg-amber-50/60 border border-stone-200/70 hover:border-brand-gold rounded-2xl transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center font-mono text-xs font-black shrink-0">
                          #{order.id.replace('HBC-', '')}
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono text-xs font-black text-brand-dark">Ticket #{order.id}</div>
                          <p className="text-[10.5px] text-stone-400 font-semibold">{order.createdAt} • {order.serviceType}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-sm sm:text-base font-black text-brand-dark font-mono">₱{Math.round(order.totalPrice)}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectOrder(order);
                          }}
                          className="px-3.5 py-2 bg-white group-hover:bg-brand-gold group-hover:text-white text-stone-700 font-bold text-xs rounded-xl transition-all border border-stone-200 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 shrink-0" />
                          <span>View Ticket</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historical Daily Income Summary Table */}
            <div className="bg-white rounded-3xl border border-brand-border/60 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-sans text-sm sm:text-base font-extrabold text-brand-dark flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-brand-gold" />
                    <span>Daily Income Log History</span>
                  </h3>
                  <p className="text-[11px] text-stone-500">Historical summary of sales per day</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 text-[10px] uppercase tracking-wider font-extrabold">
                      <th className="pb-2.5 font-bold">Date</th>
                      <th className="pb-2.5 font-bold text-right">Total Income</th>
                      <th className="pb-2.5 font-bold text-center">Completed Orders</th>
                      <th className="pb-2.5 font-bold text-center">Items Sold</th>
                      <th className="pb-2.5 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {dailyHistoryList.map(item => (
                      <tr
                        key={item.dateKey}
                        className={`hover:bg-amber-50/50 transition-colors ${
                          item.dateKey === selectedIncomeDate ? 'bg-amber-50/80 font-bold' : ''
                        }`}
                      >
                        <td className="py-3 font-bold text-brand-dark flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                          <span>{item.formattedDate}</span>
                        </td>
                        <td className="py-3 text-right font-mono font-black text-emerald-800 text-sm">
                          ₱{Math.round(item.revenue)}
                        </td>
                        <td className="py-3 text-center">
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10.5px] font-black rounded-full">
                            {item.completedCount} / {item.totalOrders}
                          </span>
                        </td>
                        <td className="py-3 text-center text-stone-600 font-bold">
                          {item.itemsCount}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setSelectedIncomeDate(item.dateKey)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              item.dateKey === selectedIncomeDate
                                ? 'bg-brand-dark text-brand-yellow shadow-2xs'
                                : 'bg-stone-100 hover:bg-brand-gold hover:text-white text-stone-700'
                            }`}
                          >
                            {item.dateKey === selectedIncomeDate ? 'Selected' : 'View Day'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Menu Management Tab Content */
          <div className="space-y-4">
            {/* Top Bar Actions */}
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <h2 className="font-sans text-base font-bold text-brand-dark">Menu Catalog</h2>
                <p className="text-xs text-stone-500">Upload photos, edit prices, or add new items</p>
              </div>

              <button
                onClick={handleStartAddItem}
                className="px-3.5 py-2 bg-brand-gold hover:bg-brand-accent text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Menu Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={menuSearchQuery}
                onChange={(e) => setMenuSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-border/60 rounded-xl text-sm focus:outline-none focus:border-brand-gold font-semibold text-brand-dark placeholder:text-stone-400 transition-all shadow-xs"
              />
              {menuSearchQuery && (
                <button
                  onClick={() => setMenuSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 font-bold text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Menu Category Slider Bar */}
            <CategorySliderBar
              categories={menuCategories}
              activeCategory={menuCategoryFilter}
              onSelectCategory={setMenuCategoryFilter}
            />

            {/* Menu Items List */}
            <div className="space-y-3">
              {filteredMenuItems.length === 0 ? (
                <div className="bg-white rounded-3xl border border-brand-border/50 p-10 text-center space-y-3">
                  <Utensils className="w-8 h-8 text-stone-300 mx-auto" />
                  <p className="text-xs text-stone-500 font-medium">No menu items match your search</p>
                </div>
              ) : (
                filteredMenuItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-brand-border/60 p-3.5 shadow-xs flex items-center justify-between gap-3 hover:shadow-md transition-all"
                  >
                    {/* Item Image Thumbnail */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 flex-shrink-0 flex items-center justify-center p-1">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain rounded-lg"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-center p-1 text-stone-400">
                          <ImageIcon className="w-5 h-5 mx-auto" />
                          <span className="text-[8px] font-bold block mt-0.5">No Photo</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider">{item.category}</span>
                        {item.popular && (
                          <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-sm uppercase tracking-wider">
                            Popular
                          </span>
                        )}
                      </div>
                      <h3 className="font-sans text-sm font-bold text-brand-dark leading-tight truncate">{item.name}</h3>
                      <p className="text-xs font-black text-brand-accent">
                        {item.type === 'drink' && item.prices
                          ? `S: ₱${item.prices.small} / M: ₱${item.prices.medium}`
                          : `₱${item.price || 0}`}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleStartEditItem(item)}
                        className="p-2.5 bg-stone-100 hover:bg-brand-gold hover:text-white text-stone-700 rounded-xl transition-all font-bold text-xs flex items-center gap-1 cursor-pointer"
                        title="Upload Photo & Edit Item"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Photo / Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          setConfirmDialog({
                            title: 'Delete Menu Item',
                            message: `Are you sure you want to delete "${item.name}" from the menu catalog?`,
                            confirmText: 'Delete Item',
                            isWarning: true,
                            onConfirm: () => onDeleteMenuItem(item.id)
                          });
                        }}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit / Add Menu Item Modal */}
      <AnimatePresence>
        {(editingMenuItem || isAddingNewItem) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/80 z-[110] flex items-center justify-center p-4 backdrop-blur-xs"
            onClick={() => {
              setEditingMenuItem(null);
              setIsAddingNewItem(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl relative border border-brand-border flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                <h3 className="font-sans text-base font-extrabold text-brand-dark flex items-center gap-1.5">
                  <Edit2 className="w-4 h-4 text-brand-gold" />
                  <span>{isAddingNewItem ? 'Add New Menu Item' : 'Edit Menu Item'}</span>
                </h3>
                <button
                  onClick={() => {
                    setEditingMenuItem(null);
                    setIsAddingNewItem(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveItemForm} className="overflow-y-auto py-4 space-y-4 flex-1">
                {/* Image Upload & Preview Section */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block">Item Photo</label>

                  <div className="relative w-full h-44 rounded-2xl bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center overflow-hidden group">
                    {itemFormData.image ? (
                      <>
                        <img
                          src={itemFormData.image}
                          alt="Preview"
                          className="w-full h-full object-contain p-2"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="px-3 py-1.5 bg-white text-brand-dark text-xs font-bold rounded-xl shadow-md cursor-pointer hover:bg-stone-100">
                            Change
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setItemFormData(prev => ({ ...prev, image: '' }))}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-4 text-center">
                        <Upload className="w-8 h-8 text-brand-gold mb-1" />
                        <span className="text-xs font-bold text-brand-dark">Upload Photo from Phone / PC</span>
                        <span className="text-[10px] text-stone-400 mt-0.5">Click to choose image file (.jpg, .png, .webp)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Or Paste Image URL */}
                  <div className="pt-1">
                    <span className="text-[10px] text-stone-400 font-bold block mb-1">
                      {itemFormData.image.startsWith('data:') ? 'DEVICE PHOTO UPLOADED (OR PASTE NEW WEB LINK BELOW)' : 'OR PASTE IMAGE WEB LINK (URL)'}
                    </span>
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={itemFormData.image.startsWith('data:') ? '' : itemFormData.image}
                      onChange={(e) => {
                        const val = e.target.value;
                        setItemFormData(prev => ({ ...prev, image: val }));
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-gold text-stone-800 placeholder:text-stone-400"
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">Item Name</label>
                  <input
                    type="text"
                    required
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Katsu Curry, Iced Spanish Latte"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold"
                  />
                </div>

                {/* Item Type & Category */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 block">Type</label>
                    <select
                      value={itemFormData.type}
                      onChange={(e) => setItemFormData(prev => ({ ...prev, type: e.target.value as ItemType }))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold cursor-pointer"
                    >
                      <option value="meal">Meal / Food</option>
                      <option value="drink">Beverage / Drink</option>
                      <option value="pastry">Bread & Pastry</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 block">Category</label>
                    <input
                      type="text"
                      required
                      value={itemFormData.category}
                      onChange={(e) => setItemFormData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g. Mains, Signatures"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">Description</label>
                  <textarea
                    rows={2}
                    value={itemFormData.description}
                    onChange={(e) => setItemFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe ingredients, taste, or recipe notes..."
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:border-brand-gold"
                  />
                </div>

                {/* Pricing Inputs */}
                {itemFormData.type === 'drink' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700 block">Small Price (₱)</label>
                      <input
                        type="number"
                        min="0"
                        value={itemFormData.smallPrice}
                        onChange={(e) => setItemFormData(prev => ({ ...prev, smallPrice: Number(e.target.value) }))}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700 block">Medium Price (₱)</label>
                      <input
                        type="number"
                        min="0"
                        value={itemFormData.mediumPrice}
                        onChange={(e) => setItemFormData(prev => ({ ...prev, mediumPrice: Number(e.target.value) }))}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 block">Price (₱)</label>
                    <input
                      type="number"
                      min="0"
                      value={itemFormData.price}
                      onChange={(e) => setItemFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                )}

                {/* Popular Checkbox */}
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={itemFormData.popular}
                    onChange={(e) => setItemFormData(prev => ({ ...prev, popular: e.target.checked }))}
                    className="w-4 h-4 rounded text-brand-gold focus:ring-brand-gold"
                  />
                  <span className="text-xs font-bold text-stone-700">Mark as Hot & Popular Item</span>
                </label>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-gold hover:bg-brand-accent text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Individual Order Inspection Modal Overlay */}
      <AnimatePresence>
        {inspectOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/80 z-[100] flex items-center justify-center p-4 backdrop-blur-xs"
            onClick={() => setInspectOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-5 max-w-lg w-full shadow-2xl relative border border-brand-border flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-start pb-3 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-brand-gold">{inspectOrder.id}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-xs text-stone-500 font-bold">{inspectOrder.createdAt}</span>
                  </div>
                  <h3 className="font-sans text-lg font-black text-brand-dark mt-0.5">
                    {inspectOrder.customerName}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(inspectOrder.status)}
                  <button
                    onClick={() => setInspectOrder(null)}
                    className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Service & Customer details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-2xl border border-stone-200/60">
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Service Type</span>
                  <span className="font-extrabold text-stone-800">
                    {inspectOrder.serviceType === 'Delivery' ? '🚚 Delivery' : '🛍️ Counter Pickup'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Contact Number</span>
                  <span className="font-extrabold text-brand-dark font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3 text-brand-gold shrink-0" />
                    {inspectOrder.customerPhone ? (
                      <a href={`tel:${inspectOrder.customerPhone}`} className="hover:underline">
                        {inspectOrder.customerPhone}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </span>
                </div>
                {inspectOrder.serviceType === 'Delivery' && inspectOrder.address && (
                  <div className="col-span-2 pt-2 border-t border-stone-200/40">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Delivery Address</span>
                    <p className="text-stone-700 font-bold leading-tight mt-0.5">{inspectOrder.address}</p>
                    {inspectOrder.coordinates && (
                      <button
                        onClick={() => {
                          setSelectedOrder(inspectOrder);
                        }}
                        className="mt-1.5 text-xs font-bold text-brand-gold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Map Route</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* GCash Payment Verification Badge / Trigger */}
              {inspectOrder.receiptImage && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-amber-600" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">GCash Payment Attached</h4>
                      <p className="text-[10.5px] text-amber-700">Tap to inspect payment proof image</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setZoomedReceipt(inspectOrder.receiptImage || null);
                      setZoomedOrder(inspectOrder);
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    View Receipt
                  </button>
                </div>
              )}

              {/* Itemized Breakdown */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Order Items</span>
                <div className="space-y-2 bg-stone-50/70 p-3 rounded-2xl border border-stone-200/50 max-h-[220px] overflow-y-auto">
                  {inspectOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-xs border-b border-stone-200/40 last:border-0 pb-2 last:pb-0">
                      <div className="flex gap-2">
                        <span className="font-extrabold text-brand-gold">{item.quantity}x</span>
                        <div>
                          <span className="text-stone-800 font-bold">{item.menuItem.name}</span>
                          {item.customization && (
                            <p className="text-[10px] text-stone-500">
                              {item.customization.temperature} • {item.customization.size}
                              {item.customization.upgrades.length > 0 && ` • ${item.customization.upgrades.join(', ')}`}
                              {item.customization.extras.length > 0 && ` • ${item.customization.extras.join(', ')}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-stone-800">₱{Math.round(item.calculatedPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="flex justify-between items-center bg-brand-cream/60 p-3 rounded-2xl border border-brand-border/60">
                <span className="text-xs font-bold text-stone-600">Total Order Amount</span>
                <span className="text-xl font-black text-brand-dark">₱{Math.round(inspectOrder.totalPrice)}</span>
              </div>

              {/* Status Action Workflow (Locked when Completed) */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest block">Update Ticket Status</span>
                
                {inspectOrder.status === 'Completed' ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-xs">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span>This Order is Completed and Finalized</span>
                  </div>
                ) : inspectOrder.status === 'Cancelled' ? (
                  <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-xs">
                    <Lock className="w-4 h-4 text-rose-600" />
                    <span>This Order is Cancelled</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {inspectOrder.status === 'Pending' && (
                      <button
                        onClick={() => {
                          onUpdateOrderStatus(inspectOrder.id, 'Preparing');
                          setInspectOrder(prev => prev ? { ...prev, status: 'Preparing' } : null);
                        }}
                        className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Start Preparing</span>
                      </button>
                    )}

                    {inspectOrder.status === 'Preparing' && (
                      <button
                        onClick={() => {
                          const nextStatus: OrderStatus = inspectOrder.serviceType === 'Delivery' ? 'Out for Delivery' : 'Ready';
                          onUpdateOrderStatus(inspectOrder.id, nextStatus);
                          setInspectOrder(prev => prev ? { ...prev, status: nextStatus } : null);
                        }}
                        className={`py-2.5 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                          inspectOrder.serviceType === 'Delivery' ? 'bg-sky-600 hover:bg-sky-700' : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                      >
                        {inspectOrder.serviceType === 'Delivery' ? (
                          <>
                            <Truck className="w-4 h-4" />
                            <span>Rider on the Way</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Ready for Pickup</span>
                          </>
                        )}
                      </button>
                    )}

                    {(inspectOrder.status === 'Ready' || inspectOrder.status === 'Out for Delivery' || inspectOrder.status === 'Preparing') && (
                      <button
                        onClick={() => {
                          onUpdateOrderStatus(inspectOrder.id, 'Completed');
                          setInspectOrder(prev => prev ? { ...prev, status: 'Completed' } : null);
                        }}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Completed (Final)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setConfirmDialog({
                          title: 'Cancel Order',
                          message: `Are you sure you want to cancel order ticket ${inspectOrder.id}?`,
                          confirmText: 'Cancel Order',
                          isWarning: true,
                          onConfirm: () => {
                            onUpdateOrderStatus(inspectOrder.id, 'Cancelled');
                            setInspectOrder(prev => prev ? { ...prev, status: 'Cancelled' } : null);
                          }
                        });
                      }}
                      className="py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setInspectOrder(null)}
                className="w-full py-2.5 bg-brand-dark text-brand-yellow font-bold rounded-xl text-xs transition-all cursor-pointer mt-1"
              >
                Close Details
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delivery Route Map Modal Overlay */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/80 z-[100] flex items-center justify-center p-4 backdrop-blur-xs"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-4 max-w-md w-full shadow-2xl relative border border-brand-border flex flex-col gap-3 max-h-[90vh] overflow-hidden"
            >
              <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">Delivery Dispatch Map</span>
                  <h3 className="font-sans font-bold text-brand-dark text-sm">
                    Route to {selectedOrder.customerName} ({selectedOrder.id})
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedOrder.coordinates && (
                <AdminDeliveryRouteMap
                  customerCoordinates={selectedOrder.coordinates}
                  customerName={selectedOrder.customerName}
                  distanceKm={selectedOrder.deliveryDistanceKm || 2.5}
                  deliveryFee={selectedOrder.deliveryFee}
                />
              )}

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 bg-brand-dark text-brand-yellow font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Close Map
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoomed Receipt Modal Overlay */}
      <AnimatePresence>
        {zoomedReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
            onClick={() => {
              setZoomedReceipt(null);
              setZoomedOrder(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl relative border border-brand-border flex flex-col items-center gap-3.5"
            >
              <div className="flex justify-between items-center w-full pb-2 border-b border-stone-100">
                <div>
                  <span className="text-xs font-black text-brand-dark uppercase tracking-widest flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-brand-gold" /> GCash Payment Receipt
                  </span>
                  {zoomedOrder && (
                    <p className="text-[11px] font-bold text-stone-500 mt-0.5">
                      Order {zoomedOrder.id} • {zoomedOrder.customerName}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setZoomedReceipt(null);
                    setZoomedOrder(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="w-full max-h-[380px] overflow-y-auto rounded-2xl border border-stone-200/60 bg-stone-50 flex items-center justify-center p-1.5">
                <img
                  src={zoomedReceipt}
                  alt="GCash Payment Receipt"
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[350px] object-contain rounded-xl shadow-xs"
                />
              </div>

              {zoomedOrder && (
                <div className="w-full space-y-2 pt-1 border-t border-stone-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-500 font-bold">Total Amount:</span>
                    <span className="font-black text-brand-dark text-sm">₱{zoomedOrder.totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {zoomedOrder.status === 'Pending' && (
                      <button
                        onClick={() => {
                          onUpdateOrderStatus(zoomedOrder.id, 'Preparing');
                          setZoomedReceipt(null);
                          setZoomedOrder(null);
                        }}
                        className="col-span-2 py-2.5 bg-brand-gold hover:bg-brand-accent text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify GCash & Set Preparing</span>
                      </button>
                    )}

                    {zoomedOrder.status === 'Preparing' && (
                      <button
                        onClick={() => {
                          onUpdateOrderStatus(zoomedOrder.id, 'Completed');
                          setZoomedReceipt(null);
                          setZoomedOrder(null);
                        }}
                        className="col-span-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Order Completed</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setZoomedReceipt(null);
                        setZoomedOrder(null);
                      }}
                      className="col-span-2 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Close Receipt
                    </button>
                  </div>
                </div>
              )}

              {!zoomedOrder && (
                <button
                  onClick={() => setZoomedReceipt(null)}
                  className="w-full py-2.5 bg-brand-dark hover:bg-stone-800 text-brand-yellow font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Close Receipt
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/80 z-[120] flex items-center justify-center p-6 backdrop-blur-xs"
            onClick={() => setConfirmDialog(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl relative border border-brand-border flex flex-col gap-4"
            >
              <div className="flex items-center gap-2.5 text-stone-800">
                <div className={`p-2 rounded-xl ${confirmDialog.isWarning ? 'bg-amber-50 text-amber-600' : 'bg-brand-yellow/25 text-brand-dark'}`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="font-sans font-black text-brand-dark text-sm tracking-wide">
                  {confirmDialog.title}
                </h3>
              </div>

              <p className="text-xs text-stone-600 font-semibold leading-relaxed">
                {confirmDialog.message}
              </p>

              <div className="flex gap-2.5 mt-2">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  {confirmDialog.cancelText || 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog(null);
                  }}
                  className={`flex-1 py-2.5 font-bold rounded-xl text-xs transition-all cursor-pointer text-white ${
                    confirmDialog.isWarning 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-brand-dark hover:bg-stone-800'
                  }`}
                >
                  {confirmDialog.confirmText || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Admin Credentials Modal */}
      <ResetAdminModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
      />

      {/* Admin Real-Time Notifications Slide-Over Drawer */}
      <AnimatePresence>
        {isNotificationDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/60 z-[110] flex justify-end backdrop-blur-xs"
            onClick={() => setIsNotificationDrawerOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-stone-900 text-white h-full shadow-2xl flex flex-col relative border-l border-stone-800 overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-base text-white flex items-center gap-2">
                      New Order Activity
                      {adminNotifications.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black text-xs">
                          {adminNotifications.length}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-stone-400">Real-time alerts for incoming cafe orders</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsNotificationDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {adminNotifications.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-stone-500">
                      <Bell className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-300 text-sm">No new order alerts</p>
                      <p className="text-xs text-stone-500 mt-1">
                        When customers submit new orders or make updates, live notifications will chime here.
                      </p>
                    </div>
                  </div>
                ) : (
                  adminNotifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700/80 hover:border-amber-500/40 transition-all flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-amber-400 tracking-wider uppercase">
                          Order #{notif.orderId}
                        </span>
                        <span className="text-[11px] text-stone-400">{notif.timestamp}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-white">{notif.customerName}</p>
                          <p className="text-xs text-stone-400 mt-0.5">
                            Total: <span className="font-bold text-amber-300">₱{notif.totalPrice.toFixed(2)}</span>
                          </p>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            notif.serviceType === 'Delivery'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {notif.serviceType}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {adminNotifications.length > 0 && onClearNotifications && (
                <div className="p-4 border-t border-stone-800 bg-stone-950/80 flex gap-2">
                  <button
                    onClick={() => {
                      onClearNotifications();
                    }}
                    className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Clear All Alerts
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
