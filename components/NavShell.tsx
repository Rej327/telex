"use client";

import React from "react";
import {
  LayoutDashboard,
  Activity,
  LogOut,
  RefreshCcw,
  Hotel,
  BarChart3,
  EyeOff,
  Lock,
  Users,
  ChevronDown,
  PhoneCall,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface NavShellProps {
  children: React.ReactNode;
  activeTab: "monitoring" | "dashboard" | "counter";
  setActiveTab: (tab: "monitoring" | "dashboard" | "counter") => void;
  onLogout: () => void;
  onReset: () => void;
  isPrivacyMode: boolean;
  setIsPrivacyMode: (val: boolean) => void;
  profile: { id: string, username: string } | null;
}

export const NavShell: React.FC<NavShellProps> = ({
  children,
  activeTab,
  setActiveTab,
  onLogout,
  onReset,
  isPrivacyMode,
  setIsPrivacyMode,
  profile,
}) => {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex sticky top-0 h-screen z-[100] transition-all duration-500",
          isPrivacyMode
            ? "-ml-64 opacity-0 pointer-events-none"
            : "ml-0 opacity-100",
        )}
      >
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Hotel className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-primary">
                Telex
              </h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                Management
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
              On Duty
            </label>
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Users size={14} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 truncate">
                  {profile?.username || "Loading..."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm",
              activeTab === "dashboard"
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-slate-500 hover:bg-slate-50",
            )}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("monitoring")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm",
              activeTab === "monitoring"
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-slate-500 hover:bg-slate-50",
            )}
          >
            <PhoneCall size={20} />
            Call Management
          </button>
          <button
            onClick={() => setActiveTab("counter")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm",
              activeTab === "counter"
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-slate-500 hover:bg-slate-50",
            )}
          >
            <BarChart3 size={20} />
            Counter
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            onClick={() => setIsPrivacyMode(!isPrivacyMode)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm",
              isPrivacyMode
                ? "bg-amber-500/10 text-amber-600 shadow-sm"
                : "text-slate-500 hover:bg-slate-50",
            )}
          >
            {isPrivacyMode ? <Lock size={20} /> : <EyeOff size={20} />}
            {isPrivacyMode ? "Stealth Mode" : "Normal Mode"}
          </button>
          <button
            onClick={onReset}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
          >
            <RefreshCcw size={20} />
            Reset Data
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        {!isPrivacyMode && (
          <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between z-[100]">
            <div className="flex items-center gap-3">
              <Hotel className="text-primary" size={24} />
              <h1 className="text-lg font-black text-primary">Telex</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={cn(
                  "p-2 rounded-lg",
                  activeTab === "dashboard"
                    ? "text-primary bg-primary/10"
                    : "text-slate-400",
                )}
              >
                <LayoutDashboard size={20} />
              </button>
              <button
                onClick={() => setActiveTab("monitoring")}
                className={cn(
                  "p-2 rounded-lg",
                  activeTab === "monitoring"
                    ? "text-primary bg-primary/10"
                    : "text-slate-400",
                )}
              >
                <Activity size={20} />
              </button>
              <button
                onClick={() => setActiveTab("counter")}
                className={cn(
                  "p-2 rounded-lg",
                  activeTab === "counter"
                    ? "text-primary bg-primary/10"
                    : "text-slate-400",
                )}
              >
                <BarChart3 size={20} />
              </button>
            </div>
          </header>
        )}

        <main className="flex-1 relative">{children}</main>
      </div>
    </div>
  );
};
