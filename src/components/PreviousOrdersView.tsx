import React from 'react';
import { motion } from 'motion/react';
import { 
  History, 
  RotateCcw, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  PackageCheck, 
  AlertCircle, 
  XCircle, 
  Truck, 
  MapPin, 
  ChevronRight,
  Plus,
  Coffee,
  Utensils,
  Cake
} from 'lucide-react';
import { Order, CartItem, CustomerAccount } from '../types';
import { LogoIcon } from './CafeLogo';

interface PreviousOrdersViewProps {
  orders: Order[];
  customerAccount: CustomerAccount | null;
  customerName: string;
  onReorderItems: (items: CartItem[]) => void;
  onSwitchTab: (tab: 'drinks' | 'meals' | 'pastries') => void;
}

export default function PreviousOrdersView({
  orders,
  customerAccount,
  customerName,
  onReorderItems,
  onSwitchTab
}: PreviousOrdersViewProps) {
  // Filter orders by matching customer name or email (or show all customer orders on device)
  const normalizedCustomerName = customerName.trim().toLowerCase();
  
  const myOrders = orders.filter(o => {
    if (!normalizedCustomerName || normalizedCustomerName === 'walk-in customer') {
      return true; // Show all orders if walk-in or guest
    }
    return o.customerName.trim().toLowerCase() === normalizedCustomerName;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500 animate-spin shrink-0" />
            <span>Pending</span>
          </span>
        );
      case 'Preparing':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-200">
            <PackageCheck className="w-3 h-3 text-sky-500 shrink-0" />
            <span>Preparing</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>Completed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  if (myOrders.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-brand-border/60 shadow-xs text-center space-y-4 my-2">
        <div className="w-16 h-16 bg-brand-cream border border-brand-border rounded-3xl flex items-center justify-center mx-auto text-brand-gold shadow-xs">
          <History className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-xs mx-auto">
          <h3 className="font-sans font-bold text-base text-brand-dark">No Previous Orders Yet</h3>
          <p className="text-xs text-stone-500 leading-relaxed font-medium">
            Once you place an order with your account, your past favorite drinks and meals will be saved here for instant 1-click re-ordering!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center pt-2">
          <button
            onClick={() => onSwitchTab('drinks')}
            className="px-3 py-2 bg-brand-gold hover:bg-brand-accent text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <Coffee className="w-3.5 h-3.5 shrink-0" />
            <span>Drinks</span>
          </button>
          <button
            onClick={() => onSwitchTab('meals')}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Utensils className="w-3.5 h-3.5 shrink-0" />
            <span>Meals</span>
          </button>
          <button
            onClick={() => onSwitchTab('pastries')}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Cake className="w-3.5 h-3.5 shrink-0" />
            <span>Bread & Pastries</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Summary Bar */}
      <div className="flex items-center justify-between bg-brand-cream/40 p-3 rounded-2xl border border-brand-border/60">
        <div className="flex items-center gap-1.5">
          <History className="w-4 h-4 text-brand-gold shrink-0" />
          <span className="text-xs font-bold text-brand-dark flex items-center gap-1">
            Order History for <strong className="text-brand-accent">{customerName || 'Your Account'}</strong>
          </span>
          <LogoIcon className="w-4 h-4 text-brand-dark shrink-0" />
        </div>
        <span className="text-[10px] font-extrabold text-stone-500 bg-white px-2.5 py-0.5 rounded-full border border-stone-200">
          {myOrders.length} {myOrders.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      {/* Orders Cards List */}
      <div className="space-y-3.5">
        {myOrders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-4 md:p-5 border border-brand-border/80 shadow-xs hover:border-brand-gold/60 transition-all space-y-3.5 relative overflow-hidden"
          >
            {/* Top Row: Ticket ID & Status */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-xs text-brand-dark bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                    {order.id}
                  </span>
                  <span className="text-[11px] font-semibold text-stone-400">
                    • {order.createdAt}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-stone-500 flex items-center gap-1 pt-0.5">
                  <Truck className="w-3 h-3 text-brand-gold shrink-0" />
                  <span>{order.serviceType} Order</span>
                  {order.address && <span className="truncate max-w-[160px]">• {order.address}</span>}
                </p>
              </div>

              <div>{getStatusBadge(order.status)}</div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-2">
              {order.items.map((cartItem, idx) => {
                const { menuItem, quantity, customization, calculatedPrice } = cartItem;
                const custParts: string[] = [];
                if (customization) {
                  if (customization.temperature) custParts.push(customization.temperature);
                  if (customization.size) custParts.push(customization.size);
                  if (customization.upgrades && customization.upgrades.length > 0) {
                    custParts.push(...customization.upgrades);
                  }
                  if (customization.extras && customization.extras.length > 0) {
                    custParts.push(...customization.extras);
                  }
                }

                return (
                  <div
                    key={`${order.id}-item-${idx}`}
                    className="flex items-center justify-between bg-stone-50/80 p-2.5 rounded-2xl border border-stone-100 gap-3"
                  >
                    {menuItem.image && (
                      <img
                        src={menuItem.image}
                        alt={menuItem.name}
                        className="w-11 h-11 object-cover rounded-xl shrink-0 border border-stone-200/60"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-xs text-brand-dark truncate">
                          {menuItem.name}
                        </span>
                        <span className="text-[10px] font-bold text-stone-500 bg-white px-1.5 py-0.2 rounded border border-stone-200 shrink-0">
                          x{quantity}
                        </span>
                      </div>

                      {custParts.length > 0 && (
                        <p className="text-[10px] text-stone-500 font-medium truncate">
                          {custParts.join(' • ')}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-1.5">
                      <span className="font-bold text-xs text-brand-dark">
                        ₱{calculatedPrice * quantity}
                      </span>
                      <button
                        onClick={() => onReorderItems([cartItem])}
                        title="Re-order this item"
                        className="p-1.5 bg-brand-cream hover:bg-brand-yellow/40 text-brand-gold rounded-lg border border-brand-border/60 transition-all cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total & Re-Order Ticket Action */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                  Total Amount
                </span>
                <span className="text-sm font-black text-brand-accent">
                  ₱{order.totalPrice.toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => onReorderItems(order.items)}
                className="px-3.5 py-2.5 bg-brand-gold hover:bg-brand-accent text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-98"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Re-Order Entire Ticket</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

