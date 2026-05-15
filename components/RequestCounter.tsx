"use client";

import React from "react";
import {
  BarChart3,
  Check,
  Copy,
  Package,
  Box,
  ClipboardList,
} from "lucide-react";

interface RequestCounterProps {
  countsByType: Record<string, Record<string, number>>;
  onCopyTotals: () => void;
  copyState: boolean;
}

export const RequestCounter: React.FC<RequestCounterProps> = ({
  countsByType,
  onCopyTotals,
  copyState,
}) => {
  const typeLabels: Record<string, string> = {
    guest: "Guest Requests",
    res_in: "Transfers (In)",
    res_out: "Transfers (Out)",
    inq_in: "Inquiries (In)",
    inq_out: "Inquiries (Out)",
    booking_confirmation: "Booking Confirmations",
  };

  const hasAnyCounts = Object.values(countsByType).some(
    (c) => Object.keys(c).length > 0,
  );

  return (
    <div className="space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-primary">
            <ClipboardList size={20} strokeWidth={2.5} />
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              Item Inventory
            </h1>
          </div>
          <p className="text-[12px] text-muted-foreground font-bold uppercase tracking-widest">
            Real-time Metrics
          </p>
        </div>
        {hasAnyCounts && (
          <button
            onClick={onCopyTotals}
            className="group flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-primary transition-all shadow-lg shadow-slate-200 font-black text-[12px] uppercase tracking-widest"
          >
            {copyState ? <Check size={14} /> : <Copy size={14} />}
            {copyState ? "Copied" : "Copy Report"}
          </button>
        )}
      </header>

      <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-100/50">
        {!hasAnyCounts ? (
          <div className="py-16 text-center space-y-3">
            <div className="inline-flex p-4 rounded-full bg-slate-50 text-slate-200">
              <Box size={32} strokeWidth={1} />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[12px]">
              No data
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(countsByType).map(([type, counts]) => {
              if (Object.keys(counts).length === 0) return null;

              const totalItems = Object.values(counts).reduce(
                (a, b) => a + b,
                0,
              );

              return (
                <div key={type} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                      {typeLabels[type] || type}
                    </h2>
                    <div className="h-px w-full bg-slate-50"></div>
                    <div className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[12px] font-black rounded-md whitespace-nowrap uppercase">
                      {totalItems} total
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4">
                    {Object.entries(counts).map(([item, count]) => (
                      <div
                        key={item}
                        className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                      >
                        <span className="text-2xl font-black text-slate-800 group-hover:text-primary transition-colors">
                          {count}
                        </span>
                        <span className="text-[12px] font-black text-slate-400 uppercase tracking-tight text-center mt-1 group-hover:text-slate-600 truncate w-full px-1">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
