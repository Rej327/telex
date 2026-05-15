"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Check,
  AlertTriangle,
  Database,
  Info,
  Eye,
  Lock,
  Hotel,
} from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onAccept }) => {
  const [hasRead, setHasRead] = useState(false);
  const [revealed, setRevealed] = useState({
    free: false,
    liability: false,
    privacy: false,
  });

  const allRevealed = revealed.free && revealed.liability && revealed.privacy;

  const toggleReveal = (key: keyof typeof revealed) => {
    setRevealed((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-50 bg-gradient-to-br from-slate-50 to-white flex items-center gap-4 shrink-0">
              <div className="p-3 rounded-2xl bg-primary shadow-xl shadow-primary/30 text-white">
                <Hotel size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-1">
                  System Notice
                </h3>
                <p className="text-[12px] font-black text-primary uppercase tracking-[0.2em]">
                  Operational Usage Agreement
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                {/* Free Usage */}
                <div className="relative group">
                  <div
                    className={cn(
                      "flex gap-4 p-4 rounded-2xl border transition-all duration-500",
                      !revealed.free
                        ? "bg-slate-50 border-slate-100 blur-sm grayscale opacity-50"
                        : "bg-blue-50/30 border-blue-100 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5",
                    )}
                  >
                    <div className="text-blue-500 shrink-0 mt-1">
                      <Info size={20} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                        Open System Protocol
                      </p>
                      <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                        This interface is provided as a zero-cost utility for
                        hotel operations. No licensing fees apply for active
                        sessions.
                      </p>
                    </div>
                  </div>
                  {!revealed.free && (
                    <button
                      onClick={() => toggleReveal("free")}
                      className="absolute inset-0 flex items-center justify-center rounded-2xl transition-all group"
                    >
                      <div className="bg-slate-900 px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:scale-105 transition-transform">
                        <Lock size={12} className="text-primary" /> Unlock Entry
                      </div>
                    </button>
                  )}
                </div>

                {/* Liability */}
                <div className="relative group">
                  <div
                    className={cn(
                      "flex gap-4 p-4 rounded-2xl border transition-all duration-500",
                      !revealed.liability
                        ? "bg-slate-50 border-slate-100 blur-sm grayscale opacity-50"
                        : "bg-red-50/30 border-red-100 hover:bg-white hover:shadow-xl hover:shadow-red-500/5",
                    )}
                  >
                    <div className="text-red-500 shrink-0 mt-1">
                      <AlertTriangle size={20} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                        Risk Mitigation
                      </p>
                      <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                        The developer holds no liability for data interruptions
                        or operational delays. System maintenance is handled
                        locally.
                      </p>
                    </div>
                  </div>
                  {!revealed.liability && (
                    <button
                      onClick={() => toggleReveal("liability")}
                      className="absolute inset-0 flex items-center justify-center rounded-2xl transition-all group"
                    >
                      <div className="bg-slate-900 px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:scale-105 transition-transform">
                        <Lock size={12} className="text-primary" /> Unlock Entry
                      </div>
                    </button>
                  )}
                </div>

                {/* Privacy */}
                <div className="relative group">
                  <div
                    className={cn(
                      "flex gap-4 p-4 rounded-2xl border transition-all duration-500",
                      !revealed.privacy
                        ? "bg-slate-50 border-slate-100 blur-sm grayscale opacity-50"
                        : "bg-emerald-50/30 border-emerald-100 hover:bg-white hover:shadow-xl hover:shadow-emerald-500/5",
                    )}
                  >
                    <div className="text-emerald-500 shrink-0 mt-1">
                      <Database size={20} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                        Local Data Isolation
                      </p>
                      <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                        Privacy First Architecture: This system operates with
                        **NO CLOUD DATABASE**. All records reside exclusively in
                        your browser cache.
                      </p>
                    </div>
                  </div>
                  {!revealed.privacy && (
                    <button
                      onClick={() => toggleReveal("privacy")}
                      className="absolute inset-0 flex items-center justify-center rounded-2xl transition-all group"
                    >
                      <div className="bg-slate-900 px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:scale-105 transition-transform">
                        <Lock size={12} className="text-primary" /> Unlock Entry
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Acceptance */}
              <div className="pt-4 border-t border-slate-50">
                <label
                  className={cn(
                    "flex items-center gap-4 cursor-pointer group transition-all p-4 rounded-2xl",
                    !allRevealed
                      ? "opacity-30 cursor-not-allowed"
                      : "hover:bg-slate-50",
                  )}
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      disabled={!allRevealed}
                      checked={hasRead}
                      onChange={(e) => setHasRead(e.target.checked)}
                      className="peer h-7 w-7 cursor-pointer appearance-none rounded-xl border-2 border-slate-200 transition-all checked:border-primary checked:bg-primary disabled:bg-slate-100"
                    />
                    <Check
                      size={16}
                      className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none stroke-[3]"
                    />
                  </div>
                  <span className="text-[12px] font-black text-slate-600 uppercase tracking-widest group-hover:text-primary transition-colors">
                    I acknowledge and accept the system protocols
                  </span>
                </label>
              </div>
            </div>

            {/* Footer Button */}
            <div className="p-6 pt-0 shrink-0">
              <button
                onClick={onAccept}
                disabled={!hasRead || !allRevealed}
                className={cn(
                  "w-full py-4 rounded-2xl font-black transition-all shadow-2xl uppercase tracking-[0.3em] text-xs",
                  hasRead && allRevealed
                    ? "bg-slate-900 text-white hover:bg-primary hover:shadow-primary/30"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed",
                )}
              >
                {!allRevealed ? "Complete System Check" : "Authorize Session"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}
