"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, X, AlertCircle } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'clyanntelex') {
      onConfirm();
      setPassword('');
      setError(false);
      onClose();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-white/20 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="p-6 pb-0 flex justify-between items-start">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <Lock size={24} />
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 pt-4 space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Security Required</h3>
                <p className="text-xs font-medium text-slate-500">Please enter password to disable Stealth Mode.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <motion.div
                    animate={error ? { x: [-4, 4, -4, 4, 0] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <input
                      autoFocus
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(false);
                      }}
                      className={cn(
                        "w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold tracking-widest text-center text-lg",
                        error ? "border-red-500 bg-red-50" : "border-slate-100 focus:border-primary focus:bg-white"
                      )}
                    />
                  </motion.div>
                  
                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -bottom-6 left-0 right-0 text-center text-red-500 text-[10px] font-black uppercase tracking-widest"
                      >
                        Access Denied
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all shadow-lg mt-6 flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  Authorize
                </button>
              </form>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 text-center border-t border-slate-100">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                System Protected
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Helper inside the file to ensure 'cn' is available if not imported
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}
