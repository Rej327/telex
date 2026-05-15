"use client";

import React, { useState, useEffect, startTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  requirePassword?: boolean;
  correctPassword?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true,
  requirePassword = false,
  correctPassword = "clyanntelex"
}) => {
  const [password, setPassword] = useState("");
  const [isError, setIsError] = useState(false);

  // Reset state when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      startTransition(() => {
        setPassword("");
        setIsError(false);
      });
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (requirePassword && password !== correctPassword) {
      setIsError(true);
      return;
    }
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className={`p-4 rounded-2xl mb-6 ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {requirePassword ? <ShieldCheck size={32} strokeWidth={2.5} /> : <AlertTriangle size={32} strokeWidth={2.5} />}
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                  {title}
                </h3>
                
                <p className="text-slate-500 text-base leading-relaxed mb-6">
                  {message}
                </p>

                {requirePassword && (
                  <div className="w-full mb-8">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-left px-1">
                      Security Password Required
                    </label>
                    <input
                      autoFocus
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setIsError(false);
                      }}
                      placeholder="Enter security key..."
                      className={`w-full p-4 rounded-2xl border transition-all outline-none text-center font-bold ${
                        isError 
                          ? 'border-red-300 bg-red-50 text-red-600 placeholder:text-red-300' 
                          : 'border-slate-100 bg-slate-50 focus:border-primary/30 focus:bg-white'
                      }`}
                      onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                    />
                    {isError && (
                      <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-tighter">
                        Incorrect Security Key
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={handleConfirm}
                    disabled={requirePassword && password !== correctPassword}
                    className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-sm transition-all active:scale-95 shadow-lg disabled:opacity-30 disabled:pointer-events-none ${
                      isDestructive 
                        ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                        : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                    }`}
                  >
                    {confirmText}
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="w-full py-4 px-6 rounded-2xl bg-slate-50 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all active:scale-95"
                  >
                    {cancelText}
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
