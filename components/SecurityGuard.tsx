"use client";

import React, { useState } from "react";
import { Lock, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PrivacyModal } from "./PrivacyModal";

export const SecurityGuard: React.FC<{
  children: React.ReactNode;
  isPrivacyMode?: boolean;
  onDisablePrivacy?: () => void;
}> = ({ children, isPrivacyMode = false, onDisablePrivacy }) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Content Layer */}
      <div
        className={`transition-all duration-500 ${isPrivacyMode ? "blur-3xl grayscale brightness-50 pointer-events-none scale-95" : ""}`}
      >
        {children}
      </div>

      {/* Solid Privacy Overlay */}
      <AnimatePresence>
        {isPrivacyMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[50] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-3xl"
          >
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="group relative flex flex-col items-center gap-6 p-12 rounded-[4rem] bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              <div className="p-6 rounded-full bg-amber-500 text-white shadow-xl shadow-amber-500/40 group-hover:rotate-12 transition-transform">
                <ShieldAlert size={48} strokeWidth={2.5} />
              </div>
              <div className="text-center space-y-2">
                <span className="block text-white text-xl font-black uppercase tracking-[0.2em]">
                  Privacy Mode Active
                </span>
                <span className="block text-white/50 font-bold text-xs uppercase tracking-[0.3em]">
                  Authorized Personnel Only
                </span>
              </div>

              <div className="mt-8 px-8 py-3 bg-white text-slate-900 rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
                Disable Privacy
              </div>
            </button>

            <div className="absolute bottom-12 flex items-center gap-3 text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">
              <Lock size={14} />
              Telex Secured Session
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onConfirm={() => onDisablePrivacy?.()}
      />
    </div>
  );
};
