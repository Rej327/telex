"use client";

import React from 'react';
import { Download, Copy, LogOut, X, Check, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onLogout 
}) => {
  const [password, setPassword] = React.useState("");
  const isAuthorized = password === "clyanntelex";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-100 text-red-600">
                  <LogOut size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">End Shift Session</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 space-y-2">
                <p className="text-sm font-black uppercase tracking-widest text-center">⚠️ CRITICAL WARNING ⚠️</p>
                <p className="text-xs font-bold text-center leading-relaxed">
                  Logging out will PERMANENTLY WIPE all session data from this device. 
                  This action cannot be undone.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Authorize Logout (Password)
                </label>
                <input
                  autoFocus
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-bold text-center"
                />
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-white transition-all"
              >
                Go Back
              </button>
              <button
                onClick={onLogout}
                disabled={!isAuthorized}
                className={`flex-1 px-6 py-4 rounded-2xl font-bold transition-all shadow-lg ${
                  isAuthorized 
                    ? "bg-red-500 text-white hover:bg-red-600 shadow-red-100" 
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                Wipe & Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

