"use client";

import React from "react";
import { motion } from "framer-motion";
import { Settings, Hammer, Clock, Mail } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl w-full text-center z-10"
      >
        <div className="mb-8 flex justify-center relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="text-blue-500 opacity-20 absolute inset-0 flex items-center justify-center"
          >
            <Settings size={160} />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl relative"
          >
            <Hammer className="text-blue-400 w-16 h-16" />
          </motion.div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
          System Maintenance
        </h1>

        <p className="text-gray-400 text-lg md:text-xl mb-12 leading-relaxed max-w-lg mx-auto">
          We&apos;re currently performing some scheduled updates to improve your experience. 
          We&apos;ll be back online shortly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
            <Clock className="text-blue-400 w-6 h-6 mb-3 mx-auto" />
            <h3 className="text-white font-semibold mb-1">Expected Time</h3>
            <p className="text-gray-500 text-sm">~ 2 Hours</p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
            <Settings className="text-purple-400 w-6 h-6 mb-3 mx-auto" />
            <h3 className="text-white font-semibold mb-1">Status</h3>
            <p className="text-gray-500 text-sm">Updating APIs</p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
            <Mail className="text-emerald-400 w-6 h-6 mb-3 mx-auto" />
            <h3 className="text-white font-semibold mb-1">Contact</h3>
            <p className="text-gray-500 text-sm">Support Team</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="h-1 w-48 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="h-full w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
            />
          </div>
          <span className="text-blue-400/60 text-xs font-medium tracking-[0.2em] uppercase">
            Maintenance in progress
          </span>
        </div>
      </motion.div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
    </div>
  );
}
