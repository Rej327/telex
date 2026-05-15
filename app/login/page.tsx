"use client";

import React, { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Hotel, Mail, Lock, ChevronRight, Loader2 } from 'lucide-react';
import { login } from '@/app/auth/actions';
import Link from 'next/link';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
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
            <p className="text-green-100 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
              Management Login
            </p>
          </div>

          <div className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold text-center animate-in fade-in zoom-in duration-300">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center text-slate-300">
                      <Mail size={18} />
                    </div>
                    <input
                      name="email"
                      required
                      type="email"
                      placeholder="admin@telex.com"
                      className="w-full py-4 pl-12 pr-6 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-green-500/30 transition-all outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center text-slate-300">
                      <Lock size={18} />
                    </div>
                    <input
                      name="password"
                      required
                      type="password"
                      placeholder="••••••••"
                      className="w-full py-4 pl-12 pr-6 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-green-500/30 transition-all outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              <button
                disabled={isPending}
                type="submit"
                className="w-full py-4 bg-[#008333] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-green-100 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Unlock Dashboard
                    <ChevronRight size={18} strokeWidth={3} />
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-xs text-slate-400 font-bold">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-[#008333] hover:underline">
                    Create one
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
        <footer className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
          © 2026 Telex Management Systems
        </footer>
      </motion.div>
    </div>
  );
}
