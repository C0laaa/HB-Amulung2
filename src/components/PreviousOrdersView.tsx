import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Cake,
  Eye,
  X,
  Receipt
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
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  // Filter orders by matching customer name, phone, or account
  const normalizedCustomerName = customerName.trim().toLowerCase();
  const accountPhone = customerAccount?.phone?.trim();
  
  const myOrders = orders.filter(o => {
    if (!normalizedCustomerName || normalizedCustomerName === 'walk-in customer') {
      return true; // Show all orders on device if guest
    }
    const nameMatch = o.customerName.trim().toLowerCase() === normalizedCustomerName;
    const phoneMatch = accountPhone && o.customerPhone && o.customerPhone.trim() === accountPhone;
    return nameMatch || phoneMatch;
  });

  const getStatusBadge = (status: Order['status'], serviceType?: 'Pickup' | 'Delivery') => {
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
      case 'Out for Delivery':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full border border-purple-200">
            <Truck className="w-3 h-3 text-purple-600 animate-bounce shrink-0" />
            <span>Rider En Route</span>
          </span>
        );
      case 'Ready':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-300">
            {serviceType === 'Delivery' ? (
              <>
                <Truck className="w-3 h-3 text-purple-600 animate-bounce shrink-0" />
                <span>Rider En Route</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Ready for Pickup</span>
              </>
            )}
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

              <div>{getStatusBadge(order.status, order.serviceType)}</div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-2">
              {order.items.map((cartItem, idx) => {
                const menuItem = cartItem.menuItem;
                const quantity = cartItem.quantity || 1;
                const customization = cartItem.customization;
                const itemName = menuItem?.name || (cartItem as any).name || 'Menu Item';
                const unitPrice = cartItem.calculatedPrice ?? (cartItem as any).price ?? menuItem?.price ?? 0;
                const itemImage = menuItem?.image || (cartItem as any).image;

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
                    {itemImage && (
                      <img
                        src={itemImage}
                        alt={itemName}
                        className="w-11 h-11 object-cover rounded-xl shrink-0 border border-stone-200/60"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-xs text-brand-dark truncate">
                          {itemName}
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
                        ₱{(unitPrice * quantity).toFixed(2)}
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
            <div className="pt-2 border-t border-stone-100 space-y-1.5">
              {order.serviceType === 'Delivery' && (
                <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-100/80 text-[11px] space-y-1 font-semibold text-stone-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span className="font-mono">₱{(order.totalPrice - (order.deliveryFee || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Delivery Fee ({order.deliveryDistanceKm || 1} km):</span>
                    <span className="font-mono">+ ₱{(order.deliveryFee || 60).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-0.5 gap-2 flex-wrap">
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                    Total Amount
                  </span>
                  <span className="text-sm font-black text-brand-accent">
                    ₱{order.totalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {order.receiptImage && (
                    <button
                      type="button"
                      onClick={() => setViewingReceipt(order.receiptImage!)}
                      className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-xl transition-all border border-blue-200 flex items-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Receipt className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>View GCash Receipt</span>
                    </button>
                  )}

                  <button
                    onClick={() => onReorderItems(order.items)}
                    className="px-3.5 py-2 bg-brand-gold hover:bg-brand-accent text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-98"
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    <span>Re-Order</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* GCash Receipt Image Modal */}
      <AnimatePresence>
        {viewingReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/70 z-50 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setViewingReceipt(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full overflow-hidden shadow-2xl border border-stone-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 bg-brand-cream border-b border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg text-blue-800">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-brand-dark">GCash Payment Proof</h3>
                    <span className="text-[10px] text-stone-500 font-medium">Uploaded confirmation screenshot</span>
                  </div>
                </div>
                <button
                  onClick={() => setViewingReceipt(null)}
                  className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-stone-950 flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-y-auto">
                <img
                  src={viewingReceipt}
                  alt="GCash Payment Receipt"
                  className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg border border-stone-800"
                />
              </div>

              <div className="p-3.5 bg-white border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">Customer Payment Verification Proof</span>
                <button
                  onClick={() => setViewingReceipt(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

