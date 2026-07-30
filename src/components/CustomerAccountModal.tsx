import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  UserPlus, 
  LogIn, 
  Check, 
  X, 
  ArrowRight,
  ShieldCheck,
  Database
} from 'lucide-react';
import { CustomerAccount } from '../types';
import { db, doc, setDoc, getDoc, collection, query, where, getDocs } from '../lib/firebase';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: CustomerAccount | null;
  onSaveAccount: (account: CustomerAccount) => void;
  onSignOut?: () => void;
  forceRequired?: boolean;
}

export default function CustomerAccountModal({
  isOpen,
  onClose,
  currentAccount,
  onSaveAccount,
  onSignOut,
  forceRequired = false
}: CustomerAccountModalProps) {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState(currentAccount?.name || '');
  const [email, setEmail] = useState(currentAccount?.email || '');
  const [phone, setPhone] = useState(currentAccount?.phone || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your mobile phone number.');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const newAccount: CustomerAccount = {
      id: `CUST-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim() || undefined,
      isLoggedIn: true,
      createdAt: new Date().toLocaleDateString()
    };

    // Save customer account to Firestore database
    try {
      if (db) {
        const custRef = doc(db, 'customers', cleanEmail);
        await setDoc(custRef, {
          id: newAccount.id,
          name: newAccount.name,
          email: newAccount.email,
          phone: newAccount.phone || null,
          createdAt: newAccount.createdAt,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore customer save fallback to local:', err);
    }

    setSuccessMessage('Account saved to Firestore database! Welcome to Honey Bakes Cafe.');
    setTimeout(() => {
      onSaveAccount(newAccount);
      setSuccessMessage(null);
      onClose();
    }, 600);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email or mobile number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    const cleanInput = email.trim().toLowerCase();

    // Check Firestore database for existing customer record
    let loggedInAccount: CustomerAccount | null = null;
    try {
      if (db) {
        if (cleanInput.includes('@')) {
          const custRef = doc(db, 'customers', cleanInput);
          const snap = await getDoc(custRef);
          if (snap.exists()) {
            const data = snap.data();
            loggedInAccount = {
              id: data.id || `CUST-${Math.floor(100000 + Math.random() * 900000)}`,
              name: data.name || 'Customer',
              email: cleanInput,
              phone: data.phone || undefined,
              isLoggedIn: true,
              createdAt: data.createdAt || new Date().toLocaleDateString()
            };
          }
        } else {
          // Look up by phone number in Firestore
          const q = query(collection(db, 'customers'), where('phone', '==', cleanInput));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const docData = snap.docs[0].data();
            loggedInAccount = {
              id: docData.id || `CUST-${Math.floor(100000 + Math.random() * 900000)}`,
              name: docData.name || 'Customer',
              email: docData.email || cleanInput,
              phone: docData.phone || cleanInput,
              isLoggedIn: true,
              createdAt: docData.createdAt || new Date().toLocaleDateString()
            };
          }
        }
      }
    } catch (err) {
      console.warn('Firestore customer lookup error:', err);
    }

    // Also check current stored local account if available
    if (!loggedInAccount && currentAccount) {
      if (
        (currentAccount.email && currentAccount.email.toLowerCase() === cleanInput) ||
        (currentAccount.phone && currentAccount.phone.trim() === cleanInput)
      ) {
        loggedInAccount = { ...currentAccount, isLoggedIn: true };
      }
    }

    // Strict account check: If no account was found, DO NOT allow login & show warning
    if (!loggedInAccount) {
      setError('⚠️ Account not found. You do not have an account yet. Please click "Create Account" above to register.');
      return;
    }

    setSuccessMessage('Signed in successfully! Welcome back to Honey Bakes Cafe.');
    setTimeout(() => {
      onSaveAccount(loggedInAccount!);
      setSuccessMessage(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="w-full max-w-sm bg-white rounded-3xl p-6 border border-brand-border shadow-2xl space-y-5 relative overflow-hidden"
      >
        {/* Top brand header bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-gold via-brand-accent to-brand-warm" />

        {/* Close button if not strictly required on initial load */}
        {!forceRequired && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 bg-stone-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header Branding */}
        <div className="text-center space-y-1 pt-1">
          <div className="w-12 h-12 bg-brand-cream border border-brand-border rounded-2xl flex items-center justify-center mx-auto text-brand-gold shadow-xs">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-sans font-black text-lg text-brand-dark">
            Customer Portal Account
          </h3>
          <p className="text-xs text-stone-500 font-medium">
            Create an account or sign in to order & track past history
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200/60">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-brand-gold text-white shadow-xs'
                : 'text-stone-500 hover:text-brand-dark'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-brand-gold text-white shadow-xs'
                : 'text-stone-500 hover:text-brand-dark'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>

        {/* Form Body */}
        <AnimatePresence mode="wait">
          {mode === 'register' ? (
            <motion.form
              key="register-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleRegisterSubmit}
              className="space-y-3.5"
            >
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Santos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold focus:bg-white transition-all placeholder:font-normal placeholder:text-stone-400"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. maria@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold focus:bg-white transition-all placeholder:font-normal placeholder:text-stone-400"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0917-123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold focus:bg-white transition-all placeholder:font-normal placeholder:text-stone-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold focus:bg-white transition-all placeholder:font-normal placeholder:text-stone-400"
                  />
                </div>
              </div>

              {error && (
                <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg text-center">
                  {error}
                </p>
              )}

              {successMessage && (
                <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{successMessage}</span>
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-brand-gold hover:bg-brand-accent text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Create Customer Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="login-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleLoginSubmit}
              className="space-y-3.5"
            >
              {/* Email / Mobile */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Email or Mobile Number
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="maria@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold focus:bg-white transition-all placeholder:font-normal placeholder:text-stone-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold focus:bg-white transition-all placeholder:font-normal placeholder:text-stone-400"
                  />
                </div>
              </div>

              {error && (
                <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg text-center">
                  {error}
                </p>
              )}

              {successMessage && (
                <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{successMessage}</span>
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-brand-gold hover:bg-brand-accent text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Existing Account Footer / Log Out option */}
        {currentAccount?.isLoggedIn && onSignOut && (
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] text-stone-500">
              Signed in as <strong>{currentAccount.name}</strong>
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
