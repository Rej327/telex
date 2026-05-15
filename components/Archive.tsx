"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getArchiveLogs } from '@/app/actions';
import { Calendar, Search, Filter, FileText, Download, User, Clock, Shield, ArrowRight, Loader2, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatFullTimestamp } from '@/lib/utils';
import * as XLSX from 'xlsx';

interface ArchiveLog {
  id: string;
  requestedBy: string;
  lastName: string;
  roomNo: string;
  guestReq: string;
  timeOfRequest: string;
  timeOfDelivered: string;
  remarks: string;
  followUp: number;
  acknowledgedBy: string;
  createdAt: number;
  callType: string;
  username: string;
  date: string;
  shift: 'AM' | 'PM';
}

export const Archive: React.FC = () => {
  const [logs, setLogs] = useState<ArchiveLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filterShift, setFilterShift] = useState<'all' | 'AM' | 'PM'>('all');
  const [filterUser, setFilterUser] = useState('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const refreshLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getArchiveLogs();
      setLogs(data as ArchiveLog[]);
    } catch (error) {
      toast.error('Failed to refresh archive');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function startFetching() {
      try {
        const data = await getArchiveLogs();
        if (!ignore) {
          setLogs(data as ArchiveLog[]);
        }
      } catch (error) {
        if (!ignore) toast.error('Failed to fetch archive');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    startFetching();
    return () => {
      ignore = true;
    };
  }, []);

  const users = useMemo(() => {
    const uniqueUsers = new Set(logs.map(l => l.username).filter(Boolean));
    return ['all', ...Array.from(uniqueUsers)];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.roomNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.guestReq.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !selectedDate || log.date === selectedDate;
      const matchesShift = filterShift === 'all' || log.shift === filterShift;
      const matchesUser = filterUser === 'all' || log.username === filterUser;

      return matchesSearch && matchesDate && matchesShift && matchesUser;
    });
  }, [logs, searchTerm, selectedDate, filterShift, filterUser]);

  // Grouping logic: Date -> Shift -> User
  const groupedLogs = useMemo(() => {
    const groups: Record<string, Record<string, Record<string, ArchiveLog[]>>> = {};

    filteredLogs.forEach(log => {
      const dateKey = log.date || 'Archives (Legacy/No Session)';
      const shiftKey = log.shift || 'General';
      const userKey = log.username || 'System';

      if (!groups[dateKey]) groups[dateKey] = {};
      if (!groups[dateKey][shiftKey]) groups[dateKey][shiftKey] = {};
      if (!groups[dateKey][shiftKey][userKey]) groups[dateKey][shiftKey][userKey] = [];
      
      groups[dateKey][shiftKey][userKey].push(log);
    });

    // Sort dates descending, then shifts (AM then PM)
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredLogs]);

  const copyExcel = useCallback(() => {
    if (filteredLogs.length === 0) return;
    const rows = filteredLogs.map(log => 
      `${log.requestedBy}\t${log.lastName}\t${log.roomNo}\t${log.guestReq}\t${log.timeOfRequest}\t${log.timeOfDelivered}\t${log.remarks}\t${log.followUp}`
    ).join("\n");
    navigator.clipboard.writeText(rows).then(() => {
      toast.success("Excel Format Copied");
    });
  }, [filteredLogs]);

  const exportToFile = useCallback(() => {
    if (filteredLogs.length === 0) return;
    const data = filteredLogs.map((log) => ({
      "Date": log.date,
      "Shift": log.shift,
      "User": log.username,
      "Requested By": log.requestedBy,
      "Last Name": log.lastName,
      "Room No.": log.roomNo,
      "Guest Req": log.guestReq,
      "Time of Request": log.timeOfRequest,
      "Time of Delivered": log.timeOfDelivered,
      Remarks: log.remarks,
      "Follow up": log.followUp,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Archive Logs");
    XLSX.writeFile(wb, `Telex_Archive_${new Date().toISOString().split("T")[0]}.xlsx`);
  }, [filteredLogs]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Archive & History</h2>
          <p className="text-slate-500 font-medium text-sm">Read-only access to historical monitoring data.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Calendar Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Filter Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:border-indigo-500/30 font-bold text-sm"
              />
            </div>
          </div>

          {/* Shift Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Shift</label>
            <select 
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value as any)}
              className="px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:border-indigo-500/30 font-bold text-sm min-w-[100px]"
            >
              <option value="all">All Shifts</option>
              <option value="AM">AM Shift</option>
              <option value="PM">PM Shift</option>
            </select>
          </div>

          {/* User Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Staff Member</label>
            <select 
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:border-indigo-500/30 font-bold text-sm min-w-[140px]"
            >
              {users.map(u => (
                <option key={u} value={u}>{u === 'all' ? 'All Staff' : u}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Search Logs</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                placeholder="Room, Name, Request..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:border-indigo-500/30 font-bold text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-auto">
            <button onClick={copyExcel} title="Copy for Excel" className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors">
              <FileText size={20} />
            </button>
            <button onClick={exportToFile} title="Download File" className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-colors">
              <Download size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Grouped Logs List */}
      <div className="space-y-6 pb-20">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading History...</p>
          </div>
        ) : groupedLogs.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border border-slate-100 shadow-sm">
            <p className="text-slate-400 font-bold">No historical data found matching your filters.</p>
          </div>
        ) : (
          groupedLogs.map(([date, shifts]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-4 px-4">
                <div className="h-px bg-slate-100 flex-1" />
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">{date}</h3>
                <div className="h-px bg-slate-100 flex-1" />
              </div>

              {/* Shifts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {['AM', 'PM'].map(shiftType => {
                  const shiftData = shifts[shiftType];
                  if (!shiftData) return null;

                  return (
                    <div key={`${date}-${shiftType}`} className="space-y-4">
                      <div className="flex items-center gap-3 px-4">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs",
                          shiftType === 'AM' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                        )}>
                          {shiftType}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift Session</span>
                      </div>

                      {Object.entries(shiftData).map(([username, userLogs]) => (
                        <div key={`${date}-${shiftType}-${username}`} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                          <button 
                            onClick={() => toggleSection(`${date}-${shiftType}-${username}`)}
                            className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-4 text-left">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                <User size={20} />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 leading-none mb-1">{username.toUpperCase()}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{userLogs.length} Records found</p>
                              </div>
                            </div>
                            <div className={cn(
                              "w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 transition-transform",
                              expandedSections[`${date}-${shiftType}-${username}`] ? "rotate-180" : ""
                            )}>
                              <ChevronDown size={16} />
                            </div>
                          </button>

                          <AnimatePresence>
                            {expandedSections[`${date}-${shiftType}-${username}`] && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden bg-slate-50/50"
                              >
                                <div className="p-6 pt-0 overflow-x-auto">
                                  <table className="w-full text-left text-xs border-separate border-spacing-y-2">
                                    <thead>
                                      <tr>
                                        <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Room</th>
                                        <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Guest</th>
                                        <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Request</th>
                                        <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {userLogs.map(log => (
                                        <tr key={log.id} className="bg-white group">
                                          <td className="px-4 py-3 rounded-l-xl font-black text-slate-900 border border-r-0 border-slate-100">{log.roomNo}</td>
                                          <td className="px-4 py-3 border-y border-slate-100">
                                            <p className="font-bold text-slate-800">{log.lastName}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Req: {log.timeOfRequest}</p>
                                          </td>
                                          <td className="px-4 py-3 border-y border-slate-100">
                                            <p className="font-medium text-slate-600 leading-tight">{log.guestReq}</p>
                                          </td>
                                          <td className="px-4 py-3 rounded-r-xl border border-l-0 border-slate-100 text-right">
                                            <div className={cn(
                                              "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter",
                                              log.remarks ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                                            )}>
                                              {log.remarks ? "Delivered" : "Pending"}
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
