import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Key, Check, AlertCircle, X, ShieldCheck, Sparkles } from 'lucide-react';
import { getAdminCredentials, updateAdminCredentials, AdminCredentials } from '../lib/adminAuth';

interface ResetAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newCreds: AdminCredentials) => void;
}

export const ResetAdminModal: React.FC<ResetAdminModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [currentCreds, setCurrentCreds] = useState<AdminCredentials>({ username: 'admin', password: '...' });
  const [newUsername, setNewUsername] = useState('admin');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getAdminCredentials().then((creds) => {
        setCurrentCreds(creds);
        setNewUsername(creds.username || 'admin');
        setNewPassword('');
        setConfirmPassword('');
        setError(null);
        setSuccessMsg(null);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!newUsername.trim()) {
      setError('Username cannot be empty.');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 4) {
      setError('Password should be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSaving(true);

    try {
      const updated = await updateAdminCredentials(newUsername, newPassword);
      setSuccessMsg('Admin credentials updated & synchronized successfully!');
      setIsSaving(false);
      if (onSuccess) {
        onSuccess(updated);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Failed to update credentials. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-3xl border border-brand-border shadow-2xl overflow-hidden relative"
      >
        {/* Header bar */}
        <div className="bg-brand-dark px-6 py-4 flex items-center justify-between text-brand-yellow">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-gold/20 rounded-xl text-brand-yellow">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm text-white">Reset Admin Credentials</h3>
              <p className="text-[10px] text-stone-300 font-medium">Update username & password for deployment</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Info Banner */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 flex items-center justify-between text-xs text-stone-600">
            <span className="font-semibold text-stone-500">Current Username:</span>
            <span className="font-mono font-bold text-brand-dark bg-white px-2 py-0.5 rounded border border-stone-200">
              {currentCreds.username}
            </span>
          </div>

          {/* New Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-gold" />
              New Admin Username
            </label>
            <input
              type="text"
              required
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new admin username"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-brand-dark focus:outline-none focus:border-brand-gold focus:bg-white transition-all font-mono"
            />
          </div>

          {/* New Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-brand-gold" />
              New Security Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password..."
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-brand-dark focus:outline-none focus:border-brand-gold focus:bg-white transition-all font-mono"
            />
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-brand-gold" />
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password..."
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-brand-dark focus:outline-none focus:border-brand-gold focus:bg-white transition-all font-mono"
            />
          </div>

          {/* Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-stone-200 hover:bg-stone-100 rounded-xl text-xs font-bold text-stone-600 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 bg-brand-gold hover:bg-amber-600 disabled:bg-stone-300 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save New Credentials</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetAdminModal;
