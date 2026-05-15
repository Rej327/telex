"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hotel, Lock, ChevronRight } from 'lucide-react';

interface SecurityPortalProps {
  onLogin: () => void;
}

export const SecurityPortal: React.FC<SecurityPortalProps> = ({ onLogin }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "clyanntelex") {
      onLogin();
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden">
          <div className="bg-[#008333] p-12 text-center">
            <div className="inline-flex p-4 bg-white/20 rounded-2xl mb-4">
              <Hotel className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">
              Telex Portal
            </h1>
          </div>

          <div className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  Access Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center text-slate-300">
                    <Lock size={18} />
                  </div>
                  <input
                    autoFocus
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                    placeholder="••••••••"
                    className={`w-full py-4 pl-12 pr-6 rounded-2xl border transition-all outline-none font-bold text-lg ${
                      error ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-100 bg-slate-50 focus:bg-white focus:border-green-500/30'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#008333] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-green-100"
              >
                Unlock Dashboard
                <ChevronRight size={18} strokeWidth={3} />
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
