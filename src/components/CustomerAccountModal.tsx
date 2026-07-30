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
  Database,
  KeyRound,
  ArrowLeft
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
  const [mode, setMode] = useState<'register' | 'login' | 'reset'>('register');
  const [name, setName] = useState(currentAccount?.name || '');
  const [email, setEmail] = useState(currentAccount?.email || '');
  const [phone, setPhone] = useState(currentAccount?.phone || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset password when logged in inside customer account
  const handleLoggedInPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanNewPass = newPassword.trim();

    if (!cleanNewPass || cleanNewPass.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }
    if (cleanNewPass !== confirmPassword.trim()) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    if (!currentAccount?.email) {
      setError('Account email not found.');
      return;
    }

    try {
      if (db) {
        const custRef = doc(db, 'customers', currentAccount.email.toLowerCase());
        await setDoc(custRef, {
          password: cleanNewPass,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      const updatedAccount: CustomerAccount = {
        ...currentAccount,
        password: cleanNewPass
      };

      onSaveAccount(updatedAccount);
      setSuccessMessage('✅ Password reset and updated successfully in database!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to update password. Please try again.');
    }
  };

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
    const cleanPass = password.trim();
    const cleanPhone = phone.trim();

    const newAccount: CustomerAccount = {
      id: `CUST-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone || undefined,
      password: cleanPass,
      isLoggedIn: true,
      createdAt: new Date().toLocaleDateString()
    };

    // Save customer account with password to Firestore database
    try {
      if (db) {
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
      }
    } catch (err) {
      console.warn('Firestore customer save fallback to local:', err);
    }

    setSuccessMessage('Account created successfully! Welcome to Honey Bakes Cafe.');
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
      setError('Please enter your registered email or mobile number.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    const cleanInput = email.trim().toLowerCase();
    const cleanPass = password.trim();

    let fetchedAccountDoc: any = null;

    // Check Firestore database for existing customer record
    try {
      if (db) {
        if (cleanInput.includes('@')) {
          const custRef = doc(db, 'customers', cleanInput);
          const snap = await getDoc(custRef);
          if (snap.exists()) {
            fetchedAccountDoc = snap.data();
          }
        } else {
          // Look up by phone number in Firestore
          const q = query(collection(db, 'customers'), where('phone', '==', cleanInput));
          const snap = await getDocs(q);
          if (!snap.empty) {
            fetchedAccountDoc = snap.docs[0].data();
          }
        }
      }
    } catch (err) {
      console.warn('Firestore customer lookup error:', err);
    }

    // Check local stored account if Firestore didn't return a record
    if (!fetchedAccountDoc && currentAccount) {
      if (
        (currentAccount.email && currentAccount.email.toLowerCase() === cleanInput) ||
        (currentAccount.phone && currentAccount.phone.trim() === cleanInput)
      ) {
        fetchedAccountDoc = {
          id: currentAccount.id,
          name: currentAccount.name,
          email: currentAccount.email,
          phone: currentAccount.phone,
          password: currentAccount.password,
          createdAt: currentAccount.createdAt
        };
      }
    }

    // 1. If NO account was found for this email/phone -> ALERT TYPO / UNREGISTERED ACCOUNT
    if (!fetchedAccountDoc) {
      setError('⚠️ Account not found. Please check for typos in your email or mobile number. If you do not have an account yet, click "Create Account" above.');
      return;
    }

    // 2. Account exists -> VERIFY PASSWORD & ALERT ON TYPO
    const storedPassword = fetchedAccountDoc.password;

    if (storedPassword) {
      if (cleanPass !== String(storedPassword).trim()) {
        setError('⚠️ Incorrect password. Please check for typos and try again.');
        return;
      }
    } else {
      // For legacy records without a stored password
      if (cleanPass.length < 4) {
        setError('⚠️ Password must be at least 4 characters long.');
        return;
      }
      // Save password to Firestore for future logins
      try {
        if (db && fetchedAccountDoc.email) {
          const custRef = doc(db, 'customers', String(fetchedAccountDoc.email).toLowerCase());
          await setDoc(custRef, { password: cleanPass }, { merge: true });
        }
      } catch (e) {}
    }

    const loggedInAccount: CustomerAccount = {
      id: fetchedAccountDoc.id || `CUST-${Math.floor(100000 + Math.random() * 900000)}`,
      name: fetchedAccountDoc.name || 'Customer',
      email: fetchedAccountDoc.email || cleanInput,
      phone: fetchedAccountDoc.phone || undefined,
      password: cleanPass,
      isLoggedIn: true,
      createdAt: fetchedAccountDoc.createdAt || new Date().toLocaleDateString()
    };

    setSuccessMessage('Signed in successfully! Welcome back to Honey Bakes Cafe.');
    setTimeout(() => {
      onSaveAccount(loggedInAccount);
      setSuccessMessage(null);
      onClose();
    }, 600);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanInput = email.trim().toLowerCase();
    const cleanNewPass = newPassword.trim();

    if (!cleanInput) {
      setError('Please enter your registered email address or mobile number.');
      return;
    }
    if (!cleanNewPass || cleanNewPass.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }
    if (cleanNewPass !== confirmPassword.trim()) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    let accountDoc: any = null;
    let docRefToUpdate: any = null;

    try {
      if (db) {
        if (cleanInput.includes('@')) {
          const custRef = doc(db, 'customers', cleanInput);
          const snap = await getDoc(custRef);
          if (snap.exists()) {
            accountDoc = snap.data();
            docRefToUpdate = custRef;
          }
        } else {
          const q = query(collection(db, 'customers'), where('phone', '==', cleanInput));
          const snap = await getDocs(q);
          if (!snap.empty) {
            accountDoc = snap.docs[0].data();
            docRefToUpdate = snap.docs[0].ref;
          }
        }
      }
    } catch (err) {
      console.warn('Firestore password reset lookup error:', err);
    }

    if (!accountDoc && currentAccount) {
      if (
        (currentAccount.email && currentAccount.email.toLowerCase() === cleanInput) ||
        (currentAccount.phone && currentAccount.phone.trim() === cleanInput)
      ) {
        accountDoc = currentAccount;
      }
    }

    if (!accountDoc) {
      setError('⚠️ Account not found. Please check for typos in your email or mobile number.');
      return;
    }

    // Update password in Firestore
    try {
      if (db) {
        const targetRef = docRefToUpdate || (accountDoc.email ? doc(db, 'customers', String(accountDoc.email).toLowerCase()) : null);
        if (targetRef) {
          await setDoc(targetRef, {
            password: cleanNewPass,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      }
    } catch (err) {
      console.warn('Failed to update password in Firestore:', err);
    }

    setSuccessMessage('✅ Password reset successfully! Redirecting to Sign In...');
    setTimeout(() => {
      setMode('login');
      setPassword(cleanNewPass);
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage(null);
    }, 1500);
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

        {/* LOGGED IN VIEW: CUSTOMER ACCOUNT PROFILE WITH RESET PASSWORD SECTION */}
        {currentAccount?.isLoggedIn ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="text-center space-y-1 pt-1">
              <div className="w-14 h-14 bg-amber-50 border border-brand-border rounded-2xl flex items-center justify-center mx-auto text-brand-gold shadow-xs">
                <User className="w-7 h-7 text-brand-gold" />
              </div>
              <h3 className="font-sans font-black text-lg text-brand-dark">
                Customer Account
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Manage your account profile & security
              </p>
            </div>

            {/* Account Info Box */}
            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                <span className="text-stone-400 font-medium">Account ID:</span>
                <span className="font-mono font-bold text-stone-700">{currentAccount.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400 font-medium">Name:</span>
                <span className="font-bold text-brand-dark">{currentAccount.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400 font-medium">Email:</span>
                <span className="font-bold text-stone-700">{currentAccount.email}</span>
              </div>
              {currentAccount.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 font-medium">Mobile:</span>
                  <span className="font-bold text-stone-700">{currentAccount.phone}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                <span className="text-stone-400 font-medium">Database Status:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                  <Database className="w-3 h-3" />
                  Synced in Firestore
                </span>
              </div>
            </div>

            {/* Reset Password Form inside Customer Account */}
            <div className="bg-amber-50/60 border border-brand-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-brand-dark">
                <KeyRound className="w-4 h-4 text-brand-gold" />
                <h4 className="font-bold text-xs">Reset Account Password</h4>
              </div>

              <form onSubmit={handleLoggedInPasswordReset} className="space-y-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    New Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="password"
                      required
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="password"
                      required
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold transition-all"
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
                  className="w-full py-2.5 bg-brand-gold hover:bg-brand-accent text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Reset & Save Password</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Sign Out option */}
            {onSignOut && (
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">
                  Signed in as <strong>{currentAccount.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Sign Out of Account
                </button>
              </div>
            )}
          </div>
        ) : (
          /* NOT LOGGED IN: PORTAL REGISTER / SIGN IN FORM */
          <>
            {/* Header Branding */}
            <div className="text-center space-y-1 pt-1">
              <div className="w-12 h-12 bg-brand-cream border border-brand-border rounded-2xl flex items-center justify-center mx-auto text-brand-gold shadow-xs">
                {mode === 'reset' ? <KeyRound className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <h3 className="font-sans font-black text-lg text-brand-dark">
                {mode === 'reset' ? 'Reset Account Password' : 'Customer Portal Account'}
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                {mode === 'reset'
                  ? 'Enter your registered email/phone and new password'
                  : 'Create an account or sign in to order & track past history'}
              </p>
            </div>

            {/* Mode Toggle Tabs */}
            <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200/60">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setSuccessMessage(null);
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
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'login' || mode === 'reset'
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
          ) : mode === 'login' ? (
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
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[10px] font-bold text-brand-gold hover:text-brand-accent hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
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
          ) : (
            <motion.form
              key="reset-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleResetPasswordSubmit}
              className="space-y-3.5"
            >
              {/* Email / Mobile input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Registered Email or Mobile Number *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. maria@gmail.com or 0917-123-4567"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold focus:bg-white transition-all placeholder:font-normal placeholder:text-stone-400"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  New Password *
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold focus:bg-white transition-all placeholder:font-normal placeholder:text-stone-400"
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                <span>Update & Save New Password</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-500 hover:text-brand-dark transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        </>
        )}
      </motion.div>
    </div>
  );
}

