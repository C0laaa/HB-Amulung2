import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CafeLogo } from './CafeLogo';
import { 
  ShieldAlert, 
  Lock, 
  User, 
  Mail,
  Phone,
  ArrowRight, 
  ArrowLeft, 
  ShoppingBag,
  LockKeyhole,
  UserPlus,
  LogIn,
  ShieldCheck,
  Eye,
  EyeOff,
  Database
} from 'lucide-react';
import { verifyAdminCredentials } from '../lib/adminAuth';
import { CustomerAccount } from '../types';
import { db, doc, setDoc, getDoc, collection, query, where, getDocs } from '../lib/firebase';

interface LoginGatewayProps {
  onSelectRole: (role: 'customer' | 'admin', account?: CustomerAccount) => void;
  savedAccount?: CustomerAccount | null;
}

export default function LoginGateway({ onSelectRole, savedAccount }: LoginGatewayProps) {
  // Mode: 'customer' or 'admin'
  const [activePortal, setActivePortal] = useState<'customer' | 'admin'>('customer');
  
  // Customer Auth Sub-Mode: 'login' or 'register'
  const [custMode, setCustMode] = useState<'login' | 'register'>('login');

  // Customer Form Fields
  const [custName, setCustName] = useState(savedAccount?.name || '');
  const [custEmail, setCustEmail] = useState(savedAccount?.email || '');
  const [custPhone, setCustPhone] = useState(savedAccount?.phone || '');
  const [custPassword, setCustPassword] = useState('');
  const [showCustPassword, setShowCustPassword] = useState(false);

  // Admin Form Fields
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // State feedback
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer Sign In Handler
  const handleCustomerLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanInput = custEmail.trim().toLowerCase();
    const cleanPass = custPassword.trim();

    if (!cleanInput) {
      setError('Please enter your registered email address or mobile number.');
      return;
    }
    if (!cleanPass) {
      setError('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);

    try {
      let fetchedAccountDoc: any = null;

      // 1. Look up in Firestore database
      if (db) {
        try {
          if (cleanInput.includes('@')) {
            const custRef = doc(db, 'customers', cleanInput);
            const snap = await getDoc(custRef);
            if (snap.exists()) {
              fetchedAccountDoc = snap.data();
            }
          } else {
            const q = query(collection(db, 'customers'), where('phone', '==', cleanInput));
            const snap = await getDocs(q);
            if (!snap.empty) {
              fetchedAccountDoc = snap.docs[0].data();
            }
          }
        } catch (dbErr) {
          console.warn('Firestore customer lookup warning:', dbErr);
        }
      }

      // 2. Fallback check local stored account
      if (!fetchedAccountDoc && savedAccount) {
        if (
          (savedAccount.email && savedAccount.email.toLowerCase() === cleanInput) ||
          (savedAccount.phone && savedAccount.phone.trim() === cleanInput)
        ) {
          fetchedAccountDoc = {
            id: savedAccount.id,
            name: savedAccount.name,
            email: savedAccount.email,
            phone: savedAccount.phone,
            password: savedAccount.password,
            createdAt: savedAccount.createdAt
          };
        }
      }

      // Check if account exists
      if (!fetchedAccountDoc) {
        setError('Account not found. Please check for typos or click "Create Account" below to register.');
        setIsSubmitting(false);
        return;
      }

      // Verify Password
      const storedPassword = fetchedAccountDoc.password;
      if (storedPassword) {
        if (cleanPass !== String(storedPassword).trim()) {
          setError('Incorrect password. Please verify your password and try again.');
          setIsSubmitting(false);
          return;
        }
      } else {
        if (cleanPass.length < 4) {
          setError('Password must be at least 4 characters long.');
          setIsSubmitting(false);
          return;
        }
        // Save password if missing
        if (db && fetchedAccountDoc.email) {
          try {
            const custRef = doc(db, 'customers', String(fetchedAccountDoc.email).toLowerCase());
            await setDoc(custRef, { password: cleanPass }, { merge: true });
          } catch (e) {}
        }
      }

      const verifiedAccount: CustomerAccount = {
        id: fetchedAccountDoc.id || `CUST-${Date.now().toString().slice(-6)}`,
        name: fetchedAccountDoc.name || 'Customer',
        email: fetchedAccountDoc.email || cleanInput,
        phone: fetchedAccountDoc.phone || undefined,
        password: cleanPass,
        isLoggedIn: true,
        createdAt: fetchedAccountDoc.createdAt || new Date().toLocaleDateString()
      };

      setSuccessMessage(`Welcome back, ${verifiedAccount.name}! Opening menu...`);
      setTimeout(() => {
        onSelectRole('customer', verifiedAccount);
      }, 500);
    } catch (err) {
      console.error('Customer login error:', err);
      setError('An error occurred while signing in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Customer Registration Handler
  const handleCustomerRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanName = custName.trim();
    const cleanEmail = custEmail.trim().toLowerCase();
    const cleanPhone = custPhone.trim();
    const cleanPass = custPassword.trim();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!cleanPhone) {
      setError('Please enter your mobile phone number.');
      return;
    }
    if (!cleanPass || cleanPass.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if email already registered in Firestore
      if (db) {
        try {
          const custRef = doc(db, 'customers', cleanEmail);
          const snap = await getDoc(custRef);
          if (snap.exists()) {
            setError('An account with this email already exists. Please switch to "Sign In".');
            setIsSubmitting(false);
            return;
          }
        } catch (dbErr) {
          console.warn('Firestore duplicate check error:', dbErr);
        }
      }

      const newAccount: CustomerAccount = {
        id: `CUST-${Date.now().toString().slice(-6)}`,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || undefined,
        password: cleanPass,
        isLoggedIn: true,
        createdAt: new Date().toLocaleDateString()
      };

      // Save to Firestore
      if (db) {
        try {
          const custRef = doc(db, 'customers', cleanEmail);
          await setDoc(custRef, {
            id: newAccount.id,
            name: newAccount.name,
            email: newAccount.email,
            phone: newAccount.phone || null,
            password: cleanPass,
            createdAt: newAccount.createdAt,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn('Firestore customer registration sync warning:', err);
        }
      }

      setSuccessMessage(`Account created successfully! Welcome, ${newAccount.name}.`);
      setTimeout(() => {
        onSelectRole('customer', newAccount);
      }, 500);
    } catch (err) {
      console.error('Customer registration error:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Staff / Admin Login Handler
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const isValid = await verifyAdminCredentials(adminUsername, adminPassword);
      if (isValid) {
        setSuccessMessage('Credentials verified! Opening Staff POS Console...');
        setTimeout(() => {
          onSelectRole('admin');
        }, 500);
      } else {
        setError('Invalid username or security password. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('Error verifying staff credentials. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream/40 flex flex-col items-center justify-center p-4 sm:p-6 relative select-none">
      {/* Background ambient accents */}
      <div className="absolute top-10 left-10 w-36 h-36 bg-brand-yellow/30 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-44 h-44 bg-brand-gold/15 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-[32px] border border-brand-border shadow-xl p-6 sm:p-8 relative overflow-hidden flex flex-col space-y-6">
        
        {/* Top Brand Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-gold via-brand-accent to-brand-warm" />

        {/* Central Logo & Subtitle */}
        <div className="flex flex-col items-center text-center space-y-2 pt-1">
          <CafeLogo align="center" className="scale-105" />
          <p className="text-[11px] text-stone-400 font-semibold tracking-wider uppercase">
            Authentication & Security Gateway
          </p>
        </div>

        {/* Portal Switcher (Customer vs Staff) */}
        <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200/80">
          <button
            type="button"
            onClick={() => {
              setActivePortal('customer');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activePortal === 'customer'
                ? 'bg-brand-gold text-white shadow-xs'
                : 'text-stone-500 hover:text-brand-dark'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Customer Portal</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePortal('admin');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activePortal === 'admin'
                ? 'bg-brand-dark text-brand-yellow shadow-xs'
                : 'text-stone-500 hover:text-brand-dark'
            }`}
          >
            <LockKeyhole className="w-3.5 h-3.5" />
            <span>Staff POS</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activePortal === 'customer' ? (
            <motion.div
              key="customer-portal-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* Customer Mode Toggle (Sign In vs Create Account) */}
              <div className="flex bg-stone-50 p-1 rounded-xl border border-stone-200/60">
                <button
                  type="button"
                  onClick={() => {
                    setCustMode('login');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    custMode === 'login'
                      ? 'bg-white text-brand-dark shadow-xs border border-stone-200/80'
                      : 'text-stone-500 hover:text-brand-dark'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustMode('register');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    custMode === 'register'
                      ? 'bg-white text-brand-dark shadow-xs border border-stone-200/80'
                      : 'text-stone-500 hover:text-brand-dark'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>

              {/* Notice that guest browsing is disabled */}
              <p className="text-[11px] text-stone-500 font-medium text-center">
                {custMode === 'login' 
                  ? 'Sign in with your verified account to access the menu & orders.' 
                  : 'Register a new customer account to place orders & track history.'}
              </p>

              {/* Form Content */}
              {custMode === 'login' ? (
                <form onSubmit={handleCustomerLoginSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      Email or Mobile Number
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                      <input
                        required
                        type="text"
                        placeholder="e.g. name@example.com or 0912..."
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold focus:bg-white transition-all placeholder:font-normal placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                      <input
                        required
                        type={showCustPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={custPassword}
                        onChange={(e) => setCustPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold focus:bg-white transition-all placeholder:font-normal placeholder:text-stone-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCustPassword(!showCustPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                      >
                        {showCustPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                      <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="flex items-center justify-center gap-1.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-brand-gold hover:bg-brand-accent disabled:bg-stone-300 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In & Open Menu</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCustomerRegisterSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                      <input
                        required
                        type="text"
                        placeholder="e.g. Maria Santos"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold focus:bg-white transition-all placeholder:font-normal placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                      <input
                        required
                        type="email"
                        placeholder="name@example.com"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold focus:bg-white transition-all placeholder:font-normal placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                      <input
                        required
                        type="tel"
                        placeholder="0917 123 4567"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold focus:bg-white transition-all placeholder:font-normal placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      Create Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                      <input
                        required
                        type={showCustPassword ? 'text' : 'password'}
                        placeholder="At least 4 characters"
                        value={custPassword}
                        onChange={(e) => setCustPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold focus:bg-white transition-all placeholder:font-normal placeholder:text-stone-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCustPassword(!showCustPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                      >
                        {showCustPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                      <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="flex items-center justify-center gap-1.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-brand-gold hover:bg-brand-accent disabled:bg-stone-300 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Registering Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Register & Enter Store</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="staff-portal-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <div className="text-center space-y-1 pb-1">
                <span className="text-[9px] font-black tracking-widest bg-brand-dark text-white px-2.5 py-0.5 rounded uppercase">
                  Staff & Kitchen Console
                </span>
                <p className="text-xs text-stone-500 font-medium pt-1">
                  Authenticate with authorized staff credentials
                </p>
              </div>

              <form onSubmit={handleAdminLoginSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    Staff Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                    <input
                      required
                      type="text"
                      placeholder="Username"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-dark focus:bg-white transition-all placeholder:font-normal placeholder:text-stone-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    Security Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                    <input
                      required
                      type={showAdminPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-dark focus:bg-white transition-all placeholder:font-normal placeholder:text-stone-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="flex items-center justify-center gap-1.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-brand-dark hover:bg-stone-900 disabled:bg-stone-400 text-brand-yellow font-bold rounded-xl text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Staff Access...</span>
                    </>
                  ) : (
                    <>
                      <LockKeyhole className="w-4 h-4" />
                      <span>Authenticate Staff POS</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info text */}
        <div className="text-center pt-1 border-t border-stone-100">
          <span className="font-mono text-[9px] text-stone-400 font-black tracking-widest uppercase">
            HONEY BAKES CAFE — ZONE 5, AMULUNG, CAGAYAN
          </span>
        </div>
      </div>
    </div>
  );
}
