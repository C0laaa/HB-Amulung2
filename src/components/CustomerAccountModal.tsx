import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  UserPlus, 
  LogIn, 
  X, 
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Check,
  Eye,
  EyeOff,
  LogOut,
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
  if (!isOpen) return null;

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState(currentAccount?.name || '');
  const [email, setEmail] = useState(currentAccount?.email || '');
  const [phone, setPhone] = useState(currentAccount?.phone || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLoggedInPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanNewPass = newPassword.trim();
    const cleanConfirmPass = confirmPassword.trim();

    if (!cleanNewPass) {
      setError('Please enter a new password.');
      return;
    }

    if (cleanNewPass.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }

    if (cleanNewPass !== cleanConfirmPass) {
      setError('Passwords do not match. Please re-enter and try again.');
      return;
    }

    if (!currentAccount?.email) {
      setError('Account email not found.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (db) {
        const custRef = doc(db, 'customers', currentAccount.email.toLowerCase());
        await setDoc(
          custRef,
          {
            password: cleanNewPass,
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        );
      }

      const updatedAccount: CustomerAccount = {
        ...currentAccount,
        password: cleanNewPass
      };

      onSaveAccount(updatedAccount);
      setSuccessMessage('✅ Password reset and saved successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating password:', err);
      setError('Failed to update password. Please check your connection.');
    } finally {
      setIsSubmitting(false);
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

        {/* LOGGED IN VIEW: ACCOUNT DETAILS, RESET PASSWORD & SIGN OUT */}
        {currentAccount?.isLoggedIn ? (
          <div className="space-y-4">
            {/* Header Profile */}
            <div className="text-center space-y-1 pt-1">
              <div className="w-13 h-13 bg-amber-50 border border-brand-border rounded-2xl flex items-center justify-center mx-auto text-brand-gold shadow-xs">
                <User className="w-6 h-6 text-brand-gold" />
              </div>
              <h3 className="font-sans font-black text-lg text-brand-dark">
                Customer Account
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Manage your account profile & password
              </p>
            </div>

            {/* Account Info Box */}
            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 space-y-1.5 text-xs">
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
                <span className="text-stone-400 font-medium">Database:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                  <Database className="w-3 h-3" />
                  Synced in Firestore
                </span>
              </div>
            </div>

            {/* Reset Password Section */}
            <div className="bg-amber-50/60 border border-brand-border/80 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center gap-1.5 text-brand-dark">
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
                      type={showNewPass ? 'text' : 'password'}
                      placeholder=""
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-8 pr-8 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                    >
                      {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      placeholder=""
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-8 pr-8 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-gold transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                    >
                      {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
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
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-brand-gold hover:bg-brand-accent text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Saving...' : 'Reset & Save Password'}</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Actions: Sign Out & Close */}
            <div className="pt-2 border-t border-stone-100 space-y-2">
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Account</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Back to Menu
              </button>
            </div>
          </div>
        ) : (
          /* NOT LOGGED IN: PORTAL REGISTER / SIGN IN FORM */
          <>
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
                    placeholder=""
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
                    placeholder=""
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
                    placeholder=""
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
                    placeholder=""
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
                    placeholder=""
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
                    placeholder=""
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
        </>
        )}
      </motion.div>
    </div>
  );
}

