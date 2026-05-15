"use client";

import React from 'react';
import { TrendingUp, Users, Clock } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    totalLogs: number;
    uniqueRooms: number;
    avgRequests: string;
    undeliveredCount: number;
    typeCounts: Record<string, number>;
  };
}


export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const typeLabels: Record<string, string> = {
    guest: "Guest Req",
    res_in: "Transfer (In)",
    res_out: "Transfer (Out)",
    inq_in: "Inq (In)",
    inq_out: "Inq (Out)",
    booking_confirmation: "Booking Conf"
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 luxury-shadow flex items-center gap-4 transition-all hover:scale-[1.02]">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Logs</p>
            <p className="text-2xl font-black text-slate-800">{stats.totalLogs}</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-slate-200 luxury-shadow flex items-center gap-4 transition-all hover:scale-[1.02]">
          <div className="p-3 rounded-xl bg-green-50 text-green-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unique Rooms</p>
            <p className="text-2xl font-black text-slate-800">{stats.uniqueRooms}</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-slate-200 luxury-shadow flex items-center gap-4 transition-all hover:scale-[1.02]">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg Requests</p>
            <p className="text-2xl font-black text-slate-800">{stats.avgRequests}</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-red-50 border border-red-100 luxury-shadow flex items-center gap-4 transition-all hover:scale-[1.02]">
          <div className="p-3 rounded-xl bg-red-100 text-red-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Undelivered</p>
            <p className="text-2xl font-black text-red-600">{stats.undeliveredCount}</p>
          </div>
        </div>
      </div>


      <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-200/50">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Request Type Distribution</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(typeLabels).map(([key, label]) => (
            <div key={key} className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-slate-800">{stats.typeCounts[key] || 0}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

