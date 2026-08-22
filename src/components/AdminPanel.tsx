import React, { useState, useRef, useEffect } from 'react';
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
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  ShoppingBag, 
  DollarSign, 
  ClipboardList, 
  AlertCircle, 
  Eye, 
  Plus, 
  Edit2, 
  Upload, 
  RotateCcw, 
  Layers, 
  User, 
  MapPin, 
  Truck, 
  Calendar, 
  Key, 
  Volume2, 
  VolumeX, 
  BellRing, 
  BellOff
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

export interface AdminPanelProps {
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
}: AdminPanelProps) {
  const [adminTab, setAdminTab] = useState<'orders' | 'income' | 'menu'>('orders');

  const nowLocal = new Date();
  const todayDateStr = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`;

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

  const getItemPrice = (item: any): number => {
    if (!item) return 0;
    const p = item.calculatedPrice ?? item.price ?? item.unitPrice ?? item.itemPrice;
    if (p !== undefined && p !== null && !isNaN(Number(p)) && Number(p) > 0) {
      return Number(p);
    }
    if (item.menuItem && typeof item.menuItem === 'object') {
      if (typeof item.menuItem.price === 'number' && item.menuItem.price > 0) {
        return item.menuItem.price;
      }
      if (item.customization?.size && item.menuItem.prices) {
        const sz = String(item.customization.size).toLowerCase();
        return item.menuItem.prices[sz] ?? item.menuItem.prices.medium ?? item.menuItem.prices.small ?? 0;
      }
    }
    return 0;
  };

  const getItemType = (item: any): string => {
    if (!item) return 'drink';
    if (item.menuItem && typeof item.menuItem === 'object' && item.menuItem.type) {
      return item.menuItem.type;
    }
    if (typeof item.menuItem === 'string' && item.menuItem) {
      const found = menuItems.find(m => m.id === item.menuItem);
      if (found) return found.type;
    }
    if (item.type) return item.type;
    return 'drink';
  };

  const [ordersDateMode, setOrdersDateMode] = useState<'today' | 'all' | 'custom'>('today');
  const [selectedQueueDate, setSelectedQueueDate] = useState<string>(todayDateStr);

  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedIncomeDate, setSelectedIncomeDate] = useState<string>(todayDateStr);
  const [incomeStatusFilter] = useState<OrderStatus | 'All'>('All');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);
  const [zoomedReceipt, setZoomedReceipt] = useState<string | null>(null);

  // Audio Context & alerts
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [, setActiveNewOrderModal] = useState<Order | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initOrUnlockAudio = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      setAudioUnlocked(true);
    } catch (e) {
      console.error('Failed to initialize audio context:', e);
    }
  };

  const playKitchenBellChime = () => {
    initOrUnlockAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const frequencies = [1046.5, 1318.5, 1567.98];
      const strokeTimes = [0, 0.22, 0.48];

      strokeTimes.forEach((delay, idx) => {
        const freq = frequencies[idx % frequencies.length];
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now + delay);

        gain1.gain.setValueAtTime(0.85, now + delay);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.65);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.start(now + delay);
        osc1.stop(now + delay + 0.7);
      });
    } catch (err) {
      console.error('Error playing chime:', err);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const newestPendingOrder = pendingOrders.length > 0 ? pendingOrders[0] : null;
  const prevPendingCountRef = useRef(0);

  useEffect(() => {
    if (pendingOrders.length > prevPendingCountRef.current) {
      if (!isMuted) {
        playKitchenBellChime();
      }
      if (newestPendingOrder) {
        setActiveNewOrderModal(newestPendingOrder);
      }
    }
    prevPendingCountRef.current = pendingOrders.length;
  }, [pendingOrders.length, isMuted, newestPendingOrder]);

  // Menu Tab States
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<string>('All');
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [isAddingNewItem, setIsAddingNewItem] = useState<boolean>(false);

  const [itemFormData, setItemFormData] = useState<{
    id: string;
    name: string;
    type: ItemType;
    category: string;
    description: string;
    image: string;
    price: number;
    hasSmall: boolean;
    hasMedium: boolean;
    smallPrice: number;
    mediumPrice: number;
    popular: boolean;
    availability: string;
    isAvailable: boolean;
  }>({
    id: '',
    name: '',
    type: 'meal',
    category: 'Mains',
    description: '',
    image: '',
    price: 250,
    hasSmall: true,
    hasMedium: true,
    smallPrice: 120,
    mediumPrice: 140,
    popular: false,
    availability: 'Hot / Iced',
    isAvailable: true
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isWarning?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const activeQueueDate = ordersDateMode === 'today' ? todayDateStr : (ordersDateMode === 'custom' ? selectedQueueDate : null);

  const filteredOrders = orders.filter(order => {
    const isLiveActiveOrder = order.status === 'Pending' || order.status === 'Preparing';
    const orderDate = getOrderDateKey(order);
    if (activeQueueDate && !isLiveActiveOrder && orderDate !== activeQueueDate) {
      return false;
    }

    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === '' || 
      order.id.toLowerCase().includes(query) || 
      order.customerName.toLowerCase().includes(query) ||
      order.items.some(item => item.menuItem?.name?.toLowerCase().includes(query));
      
    return matchesStatus && matchesSearch;
  }).sort((a, b) => {
    const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
    return numB - numA;
  });

  const queueOrdersList = activeQueueDate ? orders.filter(o => getOrderDateKey(o) === activeQueueDate) : orders;
  const completedOrders = queueOrdersList.filter(o => o.status === 'Completed');
  const totalSales = completedOrders.reduce((acc, o) => acc + o.totalPrice, 0);
  const totalDeliveryFees = completedOrders.reduce((acc, o) => acc + (o.serviceType === 'Delivery' ? (o.deliveryFee || 60) : 0), 0);
  const totalProductSales = Math.max(0, totalSales - totalDeliveryFees);
  const totalOrdersCount = queueOrdersList.length;

  const availableDatesSet = new Set(orders.map(o => getOrderDateKey(o)));
  availableDatesSet.add(todayDateStr);
  const availableDates = Array.from(availableDatesSet)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const dayOrders = orders.filter(o => getOrderDateKey(o) === selectedIncomeDate);
  const dayCompletedOrders = dayOrders.filter(o => o.status === 'Completed');
  const dayTotalRevenue = dayCompletedOrders.reduce((acc, o) => acc + o.totalPrice, 0);
  const dayDeliveryFeesRevenue = dayCompletedOrders.reduce((acc, o) => acc + (o.serviceType === 'Delivery' ? (o.deliveryFee || 60) : 0), 0);
  const dayProductsRevenue = Math.max(0, dayTotalRevenue - dayDeliveryFeesRevenue);
  const dayDeliveryCompletedCount = dayCompletedOrders.filter(o => o.serviceType === 'Delivery').length;

  let dayDrinksRevenue = 0;
  let dayMealsRevenue = 0;
  let dayTotalItemsCount = 0;

  dayCompletedOrders.forEach(o => {
    o.items.forEach(item => {
      dayTotalItemsCount += item.quantity || 1;
      const itemTotal = getItemPrice(item) * (item.quantity || 1);
      if (getItemType(item) === 'drink') {
        dayDrinksRevenue += itemTotal;
      } else {
        dayMealsRevenue += itemTotal;
      }
    });
  });

  const filteredDayOrders = dayOrders.filter(order => {
    if (incomeStatusFilter !== 'All' && order.status !== incomeStatusFilter) return false;
    return true;
  });

  const dailyHistoryList = availableDates.map(dateKey => {
    const dOrders = orders.filter(o => getOrderDateKey(o) === dateKey);
    const dCompleted = dOrders.filter(o => o.status === 'Completed');
    const dRevenue = dCompleted.reduce((acc, o) => acc + o.totalPrice, 0);
    const dDeliveryFees = dCompleted.reduce((acc, o) => acc + (o.serviceType === 'Delivery' ? (o.deliveryFee || 60) : 0), 0);
    const dProductsRevenue = Math.max(0, dRevenue - dDeliveryFees);
    const dItemsCount = dOrders.reduce((acc, o) => acc + o.items.reduce((iAcc, item) => iAcc + item.quantity, 0), 0);
    return {
      dateKey,
      formattedDate: formatDisplayDate(dateKey),
      totalOrders: dOrders.length,
      completedCount: dCompleted.length,
      revenue: dRevenue,
      deliveryFees: dDeliveryFees,
      productsRevenue: dProductsRevenue,
      itemsCount: dItemsCount
    };
  });

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

  const handleStartEditItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    setIsAddingNewItem(false);

    const isDrink = item.type === 'drink';
    const hasSmall = isDrink 
      ? Boolean(item.prices?.small !== undefined && item.prices.small !== null && Number(item.prices.small) > 0)
      : true;
    const hasMedium = isDrink 
      ? Boolean(item.prices?.medium !== undefined && item.prices.medium !== null && Number(item.prices.medium) > 0)
      : true;

    const effectiveSmall = isDrink ? (hasSmall || (!hasSmall && !hasMedium)) : true;
    const effectiveMedium = isDrink ? (hasMedium || (!hasSmall && !hasMedium)) : true;

    setItemFormData({
      id: item.id,
      name: item.name,
      type: item.type,
      category: item.category,
      description: item.description,
      image: item.image || '',
      price: item.price || 0,
      hasSmall: effectiveSmall,
      hasMedium: effectiveMedium,
      smallPrice: item.prices?.small || 120,
      mediumPrice: item.prices?.medium || 140,
      popular: item.popular || false,
      availability: item.availability || 'Hot / Iced',
      isAvailable: item.isAvailable !== false
    });
  };

  const handleStartAddItem = () => {
    setIsAddingNewItem(true);
    setEditingMenuItem(null);
    setItemFormData({
      id: 'custom-' + Date.now(),
      name: '',
      type: 'drink',
      category: 'Signatures',
      description: '',
      image: '',
      price: 289,
      hasSmall: true,
      hasMedium: true,
      smallPrice: 130,
      mediumPrice: 150,
      popular: false,
      availability: 'Hot / Iced',
      isAvailable: true
    });
  };

  const handleToggleItemSize = (item: MenuItem, sizeKey: 'small' | 'medium') => {
    if (item.type !== 'drink') return;

    const currentSmall = item.prices?.small;
    const currentMedium = item.prices?.medium;

    let newSmall = currentSmall;
    let newMedium = currentMedium;

    if (sizeKey === 'small') {
      if (currentSmall) {
        if (!currentMedium) newMedium = 140;
        newSmall = undefined;
      } else {
        newSmall = 120;
      }
    } else {
      if (currentMedium) {
        if (!currentSmall) newSmall = 120;
        newMedium = undefined;
      } else {
        newMedium = 140;
      }
    }

    const updatedPrices: { small?: number; medium?: number } = {};
    if (newSmall) updatedPrices.small = newSmall;
    if (newMedium) updatedPrices.medium = newMedium;

    onUpdateMenuItem({
      ...item,
      prices: updatedPrices
    });
  };

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

  const handleSaveItemForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormData.name.trim()) return;

    const hasSmall = itemFormData.hasSmall;
    const hasMedium = itemFormData.hasMedium;
    const effectiveSmall = hasSmall || (!hasSmall && !hasMedium);
    const effectiveMedium = hasMedium;

    const drinkPrices: { small?: number; medium?: number } = {};
    if (effectiveSmall) {
      drinkPrices.small = Number(itemFormData.smallPrice) || 120;
    }
    if (effectiveMedium) {
      drinkPrices.medium = Number(itemFormData.mediumPrice) || 140;
    }

    const updatedItem: MenuItem = {
      id: itemFormData.id || 'item-' + Date.now(),
      name: itemFormData.name.trim(),
      type: itemFormData.type,
      category: itemFormData.category.trim() || 'Mains',
      description: itemFormData.description.trim(),
      image: itemFormData.image.trim() || undefined,
      popular: itemFormData.popular,
      availability: itemFormData.availability || 'Hot / Iced',
      isAvailable: itemFormData.isAvailable,
      ...(itemFormData.type === 'drink'
        ? {
            prices: drinkPrices
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
          
          <button
            onClick={() => {
              playKitchenBellChime();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              audioUnlocked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-amber-500 text-white border-amber-400 hover:bg-amber-600 animate-pulse shadow-md'
            }`}
            title="Enable & Test Audio Sound Chime"
          >
            {audioUnlocked ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-white" />}
            <span>{audioUnlocked ? 'Sound Active 🔔' : 'Tap for Sound 🔊'}</span>
          </button>

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
          {pendingOrders.length > 0 ? (
            <span className="px-2 py-0.2 bg-amber-500 text-white font-black rounded-full text-[10px] animate-bounce">
              {pendingOrders.length} New!
            </span>
          ) : (
            <span className="px-1.5 py-0.2 bg-black/20 rounded-full text-[10px]">
              {filteredOrders.length}
            </span>
          )}
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

      {/* Flashing Top Banner for Pending Orders */}
      {pendingOrders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white py-2.5 px-4 sm:px-6 shadow-md border-b-2 border-amber-300/80 flex flex-wrap items-center justify-between gap-2.5 animate-pulse shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-white text-amber-600 shrink-0 shadow-md animate-bounce">
              <BellRing className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white text-amber-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  🚨 NEW ORDER RECEIVED ({pendingOrders.length} Waiting)
                </span>
                {newestPendingOrder && (
                  <span className="text-amber-100 text-xs font-mono font-bold truncate">
                    Ticket #{newestPendingOrder.id} • {newestPendingOrder.customerName}
                  </span>
                )}
              </div>
              <p className="text-xs font-extrabold text-white leading-tight">
                Staff attention needed! Confirm payment & start preparing in kitchen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {newestPendingOrder && (
              <button
                onClick={() => onUpdateOrderStatus(newestPendingOrder.id, 'Preparing')}
                className="px-3.5 py-1.5 bg-white text-amber-950 hover:bg-amber-100 font-black text-xs rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Start Preparing #{newestPendingOrder.id}</span>
              </button>
            )}

            <button
              onClick={() => playKitchenBellChime()}
              className="px-2.5 py-1.5 bg-amber-700/80 hover:bg-amber-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
              title="Ring Bell Sound"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ring Bell</span>
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                isMuted ? 'bg-rose-700 text-white' : 'bg-amber-700 text-white'
              }`}
              title={isMuted ? 'Unmute Order Sound' : 'Mute Order Sound'}
            >
              {isMuted ? <BellOff className="w-3.5 h-3.5" /> : <BellRing className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

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
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Resets Every Day
                </span>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div className="bg-white p-3 rounded-2xl border border-brand-border/40 shadow-xs flex flex-col justify-between">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                  {ordersDateMode === 'today' ? 'Today Net Cafe Sales' : 'Queue Net Cafe Sales'}
                </span>
                <span className="text-lg sm:text-xl font-black text-[#78350F] mt-1 truncate">₱{totalProductSales}</span>
                <div className="flex items-center gap-0.5 text-[8.5px] text-stone-500 font-bold mt-1.5 truncate">
                  <TrendingUp className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Gross Paid: ₱{totalSales}</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-sky-200/80 bg-gradient-to-br from-white to-sky-50/40 shadow-xs flex flex-col justify-between">
                <span className="text-[9px] font-extrabold text-sky-700 uppercase tracking-wider flex items-center gap-1">
                  <Truck className="w-2.5 h-2.5 text-sky-600 shrink-0" />
                  <span>Driver Fees</span>
                </span>
                <span className="text-lg sm:text-xl font-black text-sky-950 mt-1 truncate">₱{totalDeliveryFees}</span>
                <div className="flex items-center gap-1 text-[8.5px] text-sky-700 font-bold mt-1.5">
                  <span>{completedOrders.filter(o => o.serviceType === 'Delivery').length} deliveries</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-brand-border/40 shadow-xs flex flex-col justify-between">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Completed Orders</span>
                <span className="text-lg sm:text-xl font-black text-emerald-700 mt-1">{completedOrders.length}</span>
                <div className="flex items-center gap-1 text-[8.5px] text-emerald-700 font-bold mt-1.5">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Settled</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-brand-border/40 shadow-xs flex flex-col justify-between">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Queue Total</span>
                <span className="text-lg sm:text-xl font-black text-stone-800 mt-1">{totalOrdersCount}</span>
                <div className="flex items-center gap-1 text-[8.5px] text-stone-500 font-bold mt-1.5">
                  <ClipboardList className="w-2.5 h-2.5 text-stone-400" />
                  <span>{pendingOrders.length} pending</span>
                </div>
              </div>
            </div>

            {/* Search & Status Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by ticket #, customer name, or item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-brand-border/60 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <StatusSliderBar
                activeStatus={statusFilter}
                onSelectStatus={setStatusFilter}
                statuses={[
                  { id: 'All', label: 'All Statuses', count: queueOrdersList.length },
                  { id: 'Pending', label: 'Pending', count: queueOrdersList.filter(o => o.status === 'Pending').length },
                  { id: 'Preparing', label: 'Preparing', count: queueOrdersList.filter(o => o.status === 'Preparing').length },
                  { id: 'Ready', label: 'Ready', count: queueOrdersList.filter(o => o.status === 'Ready').length },
                  { id: 'Out for Delivery', label: 'Out for Delivery', count: queueOrdersList.filter(o => o.status === 'Out for Delivery').length },
                  { id: 'Completed', label: 'Completed', count: queueOrdersList.filter(o => o.status === 'Completed').length },
                  { id: 'Cancelled', label: 'Cancelled', count: queueOrdersList.filter(o => o.status === 'Cancelled').length },
                ]}
              />
            </div>

            {/* Order Cards List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-brand-border/40 shadow-sm space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                  <ClipboardList className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-stone-700 text-sm">No orders matching filter</h3>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  New incoming customer orders will appear here automatically in real time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(order => (
                  <div
                    key={order.id}
                    className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all shadow-xs space-y-4 ${
                      order.status === 'Pending'
                        ? 'border-amber-400 bg-amber-50/20 shadow-amber-100/50'
                        : 'border-brand-border/60 hover:border-brand-border'
                    }`}
                  >
                    {/* Header: Ticket ID & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-sm text-brand-dark bg-stone-100 px-2.5 py-0.5 rounded-lg border border-stone-200">
                            #{order.id}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                            order.serviceType === 'Delivery'
                              ? 'bg-sky-100 text-sky-800 border border-sky-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}>
                            {order.serviceType === 'Delivery' ? <Truck className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
                            {order.serviceType}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          <span>{order.customerName}</span>
                          {order.customerPhone && (
                            <span className="text-stone-400 font-mono text-[11px]">({order.customerPhone})</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base sm:text-lg font-mono font-black text-brand-dark block">
                          ₱{order.totalPrice}
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium">
                          {order.paymentMethod}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Address if applicable */}
                    {order.serviceType === 'Delivery' && order.deliveryAddress && (
                      <div className="bg-sky-50/80 rounded-2xl p-2.5 border border-sky-200/60 flex items-start gap-2 text-xs text-sky-950 font-medium">
                        <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">Delivery Destination:</span>
                          <p className="text-[11px] text-sky-900 leading-snug">{order.deliveryAddress}</p>
                        </div>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/60 space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block mb-1">
                        Ordered Items ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
                      </span>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-medium text-stone-700">
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="font-mono font-black text-brand-dark bg-white px-1.5 py-0.5 rounded border border-stone-200 text-[11px]">
                              {item.quantity}x
                            </span>
                            <span className="truncate font-bold">{item.menuItem?.name || item.id}</span>
                            {item.customization?.size && (
                              <span className="text-[10px] bg-stone-200/70 text-stone-600 px-1.5 py-0.2 rounded font-bold">
                                {item.customization.size}
                              </span>
                            )}
                            {item.customization?.temperature && (
                              <span className="text-[10px] text-stone-400">
                                ({item.customization.temperature})
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-xs font-bold text-stone-900 shrink-0">
                            ₱{getItemPrice(item) * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* GCash Verification & Proof Receipt */}
                    {order.paymentMethod === 'GCash' && (
                      <div className="bg-amber-50/50 rounded-2xl p-2.5 border border-amber-200/60 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-amber-900">GCash Payment:</span>
                          {order.paymentVerified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3 text-amber-600" /> Unverified
                            </span>
                          )}
                          {order.paymentRef && (
                            <span className="font-mono text-[11px] text-stone-600">
                              Ref: {order.paymentRef}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {order.receiptImage && (
                            <button
                              onClick={() => setZoomedReceipt(order.receiptImage!)}
                              className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" /> View Proof
                            </button>
                          )}
                          <button
                            onClick={() => onTogglePaymentVerification(order.id)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                              order.paymentVerified
                                ? 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                            }`}
                          >
                            {order.paymentVerified ? 'Mark Unverified' : 'Verify Payment'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Status Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {order.status === 'Pending' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Preparing')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                          >
                            <Clock className="w-3.5 h-3.5" /> Start Preparing
                          </button>
                        )}
                        {order.status === 'Preparing' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, order.serviceType === 'Delivery' ? 'Out for Delivery' : 'Ready')}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            {order.serviceType === 'Delivery' ? 'Dispatch Rider' : 'Mark Ready'}
                          </button>
                        )}
                        {(order.status === 'Ready' || order.status === 'Out for Delivery') && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Completed')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete Order
                          </button>
                        )}
                        {order.status !== 'Cancelled' && order.status !== 'Completed' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Cancelled')}
                            className="px-2.5 py-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setInspectOrder(order)}
                          className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-stone-500" /> Details
                        </button>
                        <button
                          onClick={() => {
                            setConfirmDialog({
                              title: 'Delete Ticket',
                              message: `Are you sure you want to delete ticket #${order.id}?`,
                              confirmText: 'Delete',
                              isWarning: true,
                              onConfirm: () => onDeleteOrder(order.id)
                            });
                          }}
                          className="p-1.5 text-stone-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          title="Delete ticket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : adminTab === 'income' ? (
          /* Daily Income Tab */
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-5 border border-brand-border/60 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-100 text-brand-dark">
                    <DollarSign className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-brand-dark">Daily Income Report</h2>
                    <span className="text-xs text-stone-500">Breakdown of gross sales and driver fees</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-200 rounded-xl px-2.5 py-1.5">
                  <Calendar className="w-4 h-4 text-stone-500" />
                  <input
                    type="date"
                    value={selectedIncomeDate}
                    onChange={(e) => setSelectedIncomeDate(e.target.value)}
                    className="text-xs font-bold text-stone-800 bg-transparent outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Day's Financial Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    Gross Completed Sales
                  </span>
                  <span className="text-xl font-mono font-black text-brand-dark mt-1 block">
                    ₱{dayTotalRevenue}
                  </span>
                  <span className="text-[10px] text-stone-400">{dayCompletedOrders.length} completed orders</span>
                </div>

                <div className="bg-sky-50/80 rounded-2xl p-4 border border-sky-200">
                  <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block flex items-center gap-1">
                    <Truck className="w-3 h-3 text-sky-600" /> Less: Driver Delivery Fees
                  </span>
                  <span className="text-xl font-mono font-black text-sky-950 mt-1 block">
                    - ₱{dayDeliveryFeesRevenue}
                  </span>
                  <span className="text-[10px] text-sky-700">{dayDeliveryCompletedCount} deliveries @ ₱60 avg</span>
                </div>

                <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Net Cafe Product Revenue
                  </span>
                  <span className="text-xl font-mono font-black text-emerald-900 mt-1 block">
                    ₱{dayProductsRevenue}
                  </span>
                  <span className="text-[10px] text-emerald-700">{dayTotalItemsCount} total items sold</span>
                </div>
              </div>

              {/* Breakdown details */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-brand-gold" />
                    <span className="text-xs font-bold text-stone-700">Drinks Revenue</span>
                  </div>
                  <span className="font-mono text-sm font-black text-brand-dark">₱{dayDrinksRevenue}</span>
                </div>

                <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-brand-gold" />
                    <span className="text-xs font-bold text-stone-700">Food / Pastries Revenue</span>
                  </div>
                  <span className="font-mono text-sm font-black text-brand-dark">₱{dayMealsRevenue}</span>
                </div>
              </div>
            </div>

            {/* Day's Orders Table */}
            <div className="bg-white rounded-3xl p-5 border border-brand-border/60 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-brand-dark">Orders on {formatDisplayDate(selectedIncomeDate)}</h3>
                <span className="text-xs font-mono font-bold text-stone-500">{filteredDayOrders.length} tickets</span>
              </div>

              {filteredDayOrders.length === 0 ? (
                <p className="text-xs text-stone-400 italic text-center py-6">No orders recorded for this day.</p>
              ) : (
                <div className="space-y-2">
                  {filteredDayOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-800">#{order.id}</span>
                        <span className="font-bold text-stone-700">{order.customerName}</span>
                        <span className="text-[10px] text-stone-400">({order.serviceType})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                        <span className="font-mono font-black text-brand-dark">₱{order.totalPrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historical Days Summary Table */}
            <div className="bg-white rounded-3xl p-5 border border-brand-border/60 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-brand-dark">Multi-Day Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 font-bold">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Completed</th>
                      <th className="pb-2">Gross Sales</th>
                      <th className="pb-2">Driver Fees</th>
                      <th className="pb-2 text-right">Net Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {dailyHistoryList.map(day => (
                      <tr key={day.dateKey} className="hover:bg-stone-50 cursor-pointer" onClick={() => setSelectedIncomeDate(day.dateKey)}>
                        <td className="py-2.5 font-bold">{day.formattedDate}</td>
                        <td className="py-2.5 font-mono">{day.completedCount} orders</td>
                        <td className="py-2.5 font-mono">₱{day.revenue}</td>
                        <td className="py-2.5 font-mono text-sky-700">₱{day.deliveryFees}</td>
                        <td className="py-2.5 font-mono font-black text-right text-emerald-800">₱{day.productsRevenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Menu Management Tab */
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-base text-brand-dark">Menu Catalog</h2>
                <span className="text-xs text-stone-500">Manage item pricing, size availability & details</span>
              </div>
              <button
                onClick={handleStartAddItem}
                className="px-3.5 py-2 bg-brand-gold hover:bg-amber-600 text-white font-bold text-xs rounded-2xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            {/* Menu Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search catalog items..."
                  value={menuSearchQuery}
                  onChange={(e) => setMenuSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-brand-border/60 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold/30 shadow-2xs"
                />
              </div>

              <CategorySliderBar
                categories={menuCategories}
                activeCategory={menuCategoryFilter}
                onSelectCategory={setMenuCategoryFilter}
              />
            </div>

            {/* Menu Items Grid/List */}
            <div className="space-y-2.5">
              {filteredMenuItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3 sm:p-4 border border-brand-border/60 shadow-xs flex items-center justify-between gap-3 hover:border-brand-border transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : item.type === 'drink' ? (
                        <Coffee className="w-5 h-5 text-stone-400" />
                      ) : (
                        <Utensils className="w-5 h-5 text-stone-400" />
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-xs sm:text-sm text-brand-dark truncate">{item.name}</h4>
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.2 bg-stone-100 text-stone-600 rounded-full">
                          {item.category}
                        </span>
                        {item.popular && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.2 bg-amber-100 text-amber-800 rounded-full">
                            ★ Popular
                          </span>
                        )}
                        {!item.isAvailable && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.2 bg-rose-100 text-rose-800 rounded-full">
                            Sold Out
                          </span>
                        )}
                      </div>
                      
                      {/* Price & Size Badges */}
                      <div className="flex items-center gap-2 text-xs">
                        {item.type === 'drink' ? (
                          <div className="flex items-center gap-1.5">
                            {/* Quick Small Toggle Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleItemSize(item, 'small')}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                item.prices?.small
                                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                  : 'bg-stone-100 text-stone-400 border-stone-200 line-through opacity-60'
                              }`}
                              title={item.prices?.small ? 'Click to disable Small' : 'Click to enable Small'}
                            >
                              Small: {item.prices?.small ? `₱${item.prices.small}` : 'Off'}
                            </button>

                            {/* Quick Medium Toggle Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleItemSize(item, 'medium')}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                item.prices?.medium
                                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                  : 'bg-stone-100 text-stone-400 border-stone-200 line-through opacity-60'
                              }`}
                              title={item.prices?.medium ? 'Click to disable Medium' : 'Click to enable Medium'}
                            >
                              Medium: {item.prices?.medium ? `₱${item.prices.medium}` : 'Off'}
                            </button>
                          </div>
                        ) : (
                          <span className="font-mono font-bold text-brand-dark">₱{item.price}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleStartEditItem(item)}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-brand-gold hover:text-white text-stone-600 transition-all cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDialog({
                          title: 'Delete Menu Item',
                          message: `Are you sure you want to delete "${item.name}"?`,
                          confirmText: 'Delete',
                          isWarning: true,
                          onConfirm: () => onDeleteMenuItem(item.id)
                        });
                      }}
                      className="p-2 rounded-xl hover:bg-rose-50 text-stone-300 hover:text-rose-600 transition-all cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Menu Item Modal */}
      {(editingMenuItem || isAddingNewItem) && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl border border-brand-border">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-brand-dark">
                {isAddingNewItem ? 'Add New Menu Item' : `Edit: ${itemFormData.name}`}
              </h3>
              <button
                onClick={() => {
                  setEditingMenuItem(null);
                  setIsAddingNewItem(false);
                }}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItemForm} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={itemFormData.name}
                  onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Item Type</label>
                  <select
                    value={itemFormData.type}
                    onChange={(e) => setItemFormData({ ...itemFormData, type: e.target.value as ItemType })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-gold"
                  >
                    <option value="drink">Drink</option>
                    <option value="meal">Meal / Pastry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Category</label>
                  <input
                    type="text"
                    value={itemFormData.category}
                    onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={itemFormData.description}
                  onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-gold"
                />
              </div>

              {/* Price / Size Config */}
              {itemFormData.type === 'drink' ? (
                <div className="space-y-3 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <span className="block font-bold text-stone-800">Drink Sizes & Pricing</span>
                  
                  {/* Small Size */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemFormData.hasSmall}
                        onChange={(e) => setItemFormData({ ...itemFormData, hasSmall: e.target.checked })}
                        className="rounded text-brand-gold focus:ring-brand-gold"
                      />
                      <span className="font-bold text-stone-700">Small</span>
                    </label>
                    {itemFormData.hasSmall && (
                      <div className="flex items-center gap-1">
                        <span className="text-stone-400">₱</span>
                        <input
                          type="number"
                          value={itemFormData.smallPrice}
                          onChange={(e) => setItemFormData({ ...itemFormData, smallPrice: Number(e.target.value) })}
                          className="w-20 px-2 py-1 rounded-lg border border-stone-300 text-xs"
                        />
                      </div>
                    )}
                  </div>

                  {/* Medium Size */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemFormData.hasMedium}
                        onChange={(e) => setItemFormData({ ...itemFormData, hasMedium: e.target.checked })}
                        className="rounded text-brand-gold focus:ring-brand-gold"
                      />
                      <span className="font-bold text-stone-700">Medium</span>
                    </label>
                    {itemFormData.hasMedium && (
                      <div className="flex items-center gap-1">
                        <span className="text-stone-400">₱</span>
                        <input
                          type="number"
                          value={itemFormData.mediumPrice}
                          onChange={(e) => setItemFormData({ ...itemFormData, mediumPrice: Number(e.target.value) })}
                          className="w-20 px-2 py-1 rounded-lg border border-stone-300 text-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Price (₱)</label>
                  <input
                    type="number"
                    value={itemFormData.price}
                    onChange={(e) => setItemFormData({ ...itemFormData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-gold"
                  />
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">Item Image</label>
                <div className="flex items-center gap-3">
                  {itemFormData.image && (
                    <img src={itemFormData.image} alt="preview" className="w-12 h-12 rounded-xl object-cover border border-stone-200" />
                  )}
                  <label className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer flex items-center gap-1.5 border border-stone-300">
                    <Upload className="w-3.5 h-3.5" /> Upload File
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemFormData.isAvailable}
                    onChange={(e) => setItemFormData({ ...itemFormData, isAvailable: e.target.checked })}
                    className="rounded text-brand-gold focus:ring-brand-gold"
                  />
                  <span className="font-bold text-stone-700">Available / In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemFormData.popular}
                    onChange={(e) => setItemFormData({ ...itemFormData, popular: e.target.checked })}
                    className="rounded text-brand-gold focus:ring-brand-gold"
                  />
                  <span className="font-bold text-stone-700">Mark Popular</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setEditingMenuItem(null);
                    setIsAddingNewItem(false);
                  }}
                  className="px-4 py-2 rounded-xl text-stone-500 hover:bg-stone-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-gold hover:bg-amber-600 text-white font-bold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Order Modal */}
      {inspectOrder && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl border border-brand-border">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm text-brand-dark bg-stone-100 px-2.5 py-0.5 rounded-lg border border-stone-200">
                  #{inspectOrder.id}
                </span>
                {getStatusBadge(inspectOrder.status)}
              </div>
              <button 
                onClick={() => setInspectOrder(null)} 
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-stone-50 p-2.5 rounded-xl">
                  <span className="text-stone-500 block text-[10px] uppercase font-bold">Customer Name</span>
                  <span className="font-bold text-stone-900 text-xs">{inspectOrder.customerName || 'Walk-In Customer'}</span>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-xl">
                  <span className="text-stone-500 block text-[10px] uppercase font-bold">Phone Number</span>
                  <span className="font-mono font-bold text-stone-900 text-xs">{inspectOrder.customerPhone || 'Not provided'}</span>
                </div>
              </div>

              {/* Service & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-stone-50 p-2.5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase font-bold">Service Type</span>
                    <span className="font-bold text-stone-900 text-xs">{inspectOrder.serviceType}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    inspectOrder.serviceType === 'Delivery'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {inspectOrder.serviceType}
                  </span>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-xl">
                  <span className="text-stone-500 block text-[10px] uppercase font-bold">Order Time / Date</span>
                  <span className="font-semibold text-stone-900 text-xs">
                    {inspectOrder.createdAt} {inspectOrder.orderDate ? `• ${inspectOrder.orderDate}` : ''}
                  </span>
                </div>
              </div>

              {/* Delivery Address */}
              {(inspectOrder.deliveryAddress || inspectOrder.address) && (
                <div className="bg-sky-50/80 p-3 rounded-xl border border-sky-200/60 space-y-1">
                  <span className="text-sky-800 block text-[10px] uppercase font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" /> Delivery Address
                  </span>
                  <p className="font-medium text-sky-950 text-xs leading-relaxed">
                    {inspectOrder.deliveryAddress || inspectOrder.address}
                  </p>
                </div>
              )}

              {/* Ordered Items Breakdown */}
              <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/60 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                  Ordered Items ({inspectOrder.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0})
                </span>
                <div className="space-y-1.5 divide-y divide-stone-200/40">
                  {inspectOrder.items?.map((item, idx) => (
                    <div key={idx} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-brand-dark bg-white px-1.5 py-0.2 rounded border border-stone-200 text-[10px]">
                            {item.quantity}x
                          </span>
                          <span className="font-bold text-stone-900">{item.menuItem?.name || (item as any).name || item.id}</span>
                          {item.customization?.size && (
                            <span className="text-[10px] bg-stone-200/70 text-stone-700 px-1.5 py-0.2 rounded font-bold">
                              {item.customization.size}
                            </span>
                          )}
                          {item.customization?.temperature && (
                            <span className="text-[10px] text-stone-500">
                              ({item.customization.temperature})
                            </span>
                          )}
                        </div>
                        {item.customization?.sugarLevel && (
                          <span className="text-[10px] text-stone-400 block pl-6">
                            Sugar: {item.customization.sugarLevel}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-stone-900 shrink-0">
                        ₱{getItemPrice(item) * (item.quantity || 1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Receipt Verification */}
              <div className="bg-amber-50/60 rounded-2xl p-3 border border-amber-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900">
                      Payment ({inspectOrder.paymentMethod || 'GCash'})
                    </span>
                    {inspectOrder.paymentVerified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3 text-amber-600" /> Unverified
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      onTogglePaymentVerification(inspectOrder.id);
                      setInspectOrder(prev => prev ? { ...prev, paymentVerified: !prev.paymentVerified } : null);
                    }}
                    className="text-[10px] font-bold text-brand-gold hover:underline cursor-pointer"
                  >
                    {inspectOrder.paymentVerified ? 'Mark Unverified' : 'Mark Verified'}
                  </button>
                </div>

                {inspectOrder.receiptImage && (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={inspectOrder.receiptImage}
                      alt="GCash Receipt Proof"
                      className="w-14 h-14 object-cover rounded-xl border border-stone-200 cursor-pointer shadow-xs hover:opacity-90"
                      onClick={() => setZoomedReceipt(inspectOrder.receiptImage!)}
                    />
                    <button
                      onClick={() => setZoomedReceipt(inspectOrder.receiptImage!)}
                      className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Full GCash Proof
                    </button>
                  </div>
                )}
              </div>

              {/* Total Summary */}
              <div className="bg-brand-dark text-white p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-stone-300 block">Total Order Value</span>
                  {inspectOrder.deliveryFee ? (
                    <span className="text-[10px] text-brand-yellow font-medium">
                      Includes ₱{inspectOrder.deliveryFee} delivery fee
                    </span>
                  ) : null}
                </div>
                <span className="text-xl font-mono font-black text-brand-yellow">
                  ₱{inspectOrder.totalPrice}
                </span>
              </div>

              {/* Map if available */}
              {inspectOrder.coordinates && (
                <AdminDeliveryRouteMap
                  customerCoordinates={inspectOrder.coordinates}
                  customerName={inspectOrder.customerName}
                  distanceKm={inspectOrder.deliveryDistanceKm}
                  deliveryFee={inspectOrder.deliveryFee}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Proof Zoom Modal */}
      {zoomedReceipt && (
        <div className="fixed inset-0 bg-black/80 z-60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setZoomedReceipt(null)}>
          <div className="relative max-w-lg max-h-[85vh] p-2 bg-white rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <button onClick={() => setZoomedReceipt(null)} className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 text-white cursor-pointer z-10">
              <X className="w-4 h-4" />
            </button>
            <img src={zoomedReceipt} alt="GCash proof" className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl border border-brand-border text-center">
            <h3 className="font-bold text-base text-brand-dark">{confirmDialog.title}</h3>
            <p className="text-xs text-stone-600 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl text-stone-500 hover:bg-stone-100 font-bold text-xs cursor-pointer"
              >
                {confirmDialog.cancelText || 'Cancel'}
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className={`px-4 py-2 rounded-xl font-bold text-xs text-white shadow-xs cursor-pointer ${
                  confirmDialog.isWarning ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-gold hover:bg-amber-600'
                }`}
              >
                {confirmDialog.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Admin Credentials Modal */}
      <ResetAdminModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
      />
    </div>
  );
}
