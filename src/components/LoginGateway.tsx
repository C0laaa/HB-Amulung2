import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CafeLogo } from './CafeLogo';
import { 
  Coffee, 
  ShieldAlert, 
  Lock, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  ShoppingBag,
  Terminal,
  LockKeyhole
} from 'lucide-react';
import { verifyAdminCredentials } from '../lib/adminAuth';

interface LoginGatewayProps {
  onSelectRole: (role: 'customer' | 'admin') => void;
}

export default function LoginGateway({ onSelectRole }: LoginGatewayProps) {
  const [view, setView] = useState<'select' | 'admin_login'>('select');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const isValid = await verifyAdminCredentials(username, password);
      if (isValid) {
        onSelectRole('admin');
      } else {
        setError('Invalid username or security password. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('Error verifying credentials. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream/40 flex flex-col items-center justify-center p-5 relative select-none">
      {/* Dynamic Background subtle shapes */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-brand-yellow/30 rounded-full blur-2xl" />
      <div className="absolute bottom-10 right-10 w-36 h-36 bg-brand-gold/10 rounded-full blur-2xl" />

      <div className="w-full max-w-md bg-white rounded-[32px] border border-brand-border shadow-xl p-6 md:p-8 relative overflow-hidden flex flex-col space-y-8">
        
        {/* Brand Banner Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-gold via-brand-accent to-brand-warm" />

        {/* Central Logo Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <CafeLogo align="center" className="scale-105" />
          <p className="text-[11px] text-stone-400 font-semibold tracking-wider uppercase">
            Order & staff verification gateway
          </p>
        </div>

        <AnimatePresence mode="wait">
          {view === 'select' ? (
            <motion.div
              key="select-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 flex-1 flex flex-col justify-center"
            >
              <div className="text-center space-y-1 pb-2">
                <h2 className="font-sans font-bold text-base text-brand-dark">
                  Welcome to Honey Bakes Cafe
                </h2>
                <p className="text-xs text-stone-500 font-medium">
                  Please select your portal to continue
                </p>
              </div>

              {/* Customer Button Block */}
              <button
                onClick={() => onSelectRole('customer')}
                className="w-full p-4.5 bg-brand-cream hover:bg-brand-yellow/40 border border-brand-border hover:border-brand-gold rounded-2xl transition-all cursor-pointer text-left flex items-center justify-between group active:scale-[0.99] shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-brand-gold text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-sm text-brand-dark">
                      Order as Customer
                    </h3>
                    <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                      View full menu, customize drinks, & place tickets
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-brand-gold group-hover:translate-x-1 transition-all" />
              </button>

              {/* Admin / Staff Button Block */}
              <button
                onClick={() => setView('admin_login')}
                className="w-full p-4.5 bg-white hover:bg-stone-50 border border-stone-200 hover:border-brand-dark rounded-2xl transition-all cursor-pointer text-left flex items-center justify-between group active:scale-[0.99] shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-brand-dark text-brand-yellow rounded-xl group-hover:scale-105 transition-transform">
                    <LockKeyhole className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-sm text-brand-dark">
                      Staff POS Console
                    </h3>
                    <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                      Verify ticket queue, prep, complete, & archive logs
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-brand-dark group-hover:translate-x-1 transition-all" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setView('select');
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-brand-dark transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Options</span>
                </button>
                <span className="text-[9px] font-black tracking-widest bg-brand-dark text-white px-2.5 py-0.5 rounded uppercase">
                  Staff Access
                </span>
              </div>

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    Admin Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                    <input
                      required
                      type="text"
                      placeholder=""
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-brand-dark focus:outline-none focus:border-brand-dark focus:bg-white transition-all placeholder:text-stone-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    Security Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                    <input
                      required
                      type="password"
                      placeholder=""
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-brand-dark focus:outline-none focus:border-brand-dark focus:bg-white transition-all placeholder:text-stone-400"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-brand-dark hover:bg-stone-900 disabled:bg-stone-400 text-brand-yellow font-bold rounded-xl text-sm tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Security...</span>
                    </>
                  ) : (
                    <>
                      <LockKeyhole className="w-4 h-4" />
                      <span>Authenticate POS access</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info text */}
        <div className="text-center">
          <span className="font-mono text-[9px] text-stone-400 font-black tracking-widest uppercase">
            SECURE PORTAL — ZONE 5, AMULUNG, CAGAYAN
          </span>
        </div>
      </div>
    </div>
  );
}
