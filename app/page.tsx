"use client";

import React, {
  useState,
  useEffect,
  useSyncExternalStore,
  useMemo,
  useCallback,
} from "react";
import { MonitoringTable } from "@/components/MonitoringTable";
import { AddEntry } from "@/components/AddEntry";
import { Modal } from "@/components/Modal";
import { NavShell } from "@/components/NavShell";
import { UserManagement } from "@/components/UserManagement";
import { DashboardStats } from "@/components/DashboardStats";
import { RequestCounter } from "@/components/RequestCounter";
import { Archive } from "@/components/Archive";

import { TermsModal } from "@/components/TermsModal";
import { SecurityGuard } from "@/components/SecurityGuard";
import { CallLog } from "@/types";

import {
  formatTimeHHMMH,
  parseGuestRequests,
  formatFullTimestamp,
  cn,
} from "@/lib/utils";
import {
  Download,
  Plus,
  Copy,
  Check,
  MessageCircle,
  FileText,
  Clock,
  Loader2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Toaster, toast } from "sonner";
import { PrivacyModal } from "@/components/PrivacyModal";
import {
  getLogs,
  addLog,
  updateLog,
  deleteLog,
  clearAllLogs,
  getSettings,
  updateSettings,
  getCurrentUser,
  getOrCreateDateSession,
} from "./actions";
import { logout as authLogout } from "@/app/auth/actions";
import { motion } from "framer-motion";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Home() {
  const isClient = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const [activeTab, setActiveTab] = useState<
    "monitoring" | "dashboard" | "counter" | "users" | "archive"
  >("monitoring");

  const [logs, setLogs] = useState<CallLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "undelivered">("all");

  const [copySuccess, setCopySuccess] = useState(false);
  const [viberCopySuccess, setViberCopySuccess] = useState(false);
  const [excelCopySuccess, setExcelCopySuccess] = useState(false);
  const [countsCopySuccess, setCountsCopySuccess] = useState(false);

  const [showTerms, setShowTerms] = useState(false);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [profile, setProfile] = useState<{
    id: string;
    email: string;
    username: string;
    type: "dev" | "manager" | "telex";
    status: "unverified" | "verified";
  } | null>(null);

  const [sessionDate, setSessionDate] = useState("");
  const [sessionShift, setSessionShift] = useState<"AM" | "PM" | "">("");
  const [currentDateId, setCurrentDateId] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(false);

  // Persistence Logic
  const togglePrivacyMode = useCallback(async (val: boolean) => {
    setIsPrivacyMode(val);
    await updateSettings({ privacy_mode: val });
  }, []);

  const handleAcceptTerms = useCallback(async () => {
    await updateSettings({ terms_accepted: true });
    setShowTerms(false);
  }, []);

  // Initial Load
  useEffect(() => {
    if (!isClient) return;

    const loadData = async () => {
      const savedDate = localStorage.getItem('telex_session_date') || new Date().toISOString().split('T')[0];
      const savedShift = localStorage.getItem('telex_session_shift') || (new Date().getHours() < 15 ? 'AM' : 'PM');
      
      setSessionDate(savedDate);
      setSessionShift(savedShift as any);

      const [dbLogs, dbSettings, dbProfile] = await Promise.all([
        getLogs(savedDate, savedShift),
        getSettings(),
        getCurrentUser(),
      ]);

      if (dbLogs) setLogs(dbLogs);
      if (dbSettings) {
        setIsPrivacyMode(dbSettings.privacy_mode);
        setShowTerms(!dbSettings.terms_accepted);
      }
      if (dbProfile) setProfile(dbProfile);
    };

    loadData();
  }, [isClient]);

  // Initial Client-only state
  useEffect(() => {
    const savedDate = localStorage.getItem("telex_session_date");
    const savedShift = localStorage.getItem("telex_session_shift");

    if (savedDate) setSessionDate(savedDate);
    else setSessionDate(new Date().toISOString().split("T")[0]);

    if (savedShift) setSessionShift(savedShift as any);
    else setSessionShift(new Date().getHours() < 15 ? "AM" : "PM");
  }, []);

  // Session Sync & Persist
  useEffect(() => {
    if (!profile || !sessionDate || !sessionShift) return;

    localStorage.setItem("telex_session_date", sessionDate);
    localStorage.setItem("telex_session_shift", sessionShift);

    const syncSession = async () => {
      setIsSessionLoading(true);
      try {
        const dateId = await getOrCreateDateSession(
          sessionDate,
          sessionShift as "AM" | "PM",
        );
        setCurrentDateId(dateId);
        
        // Re-fetch logs for this session
        const dbLogs = await getLogs(sessionDate, sessionShift);
        if (dbLogs) setLogs(dbLogs);
      } catch (error) {
        toast.error("Failed to sync session");
      } finally {
        setIsSessionLoading(false);
      }
    };

    syncSession();
  }, [sessionDate, sessionShift, profile]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesFilter =
        filterType === "all" || (log.callType === "guest" && !log.remarks);
      const matchesSearch =
        log.roomNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.guestReq.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [logs, filterType, searchTerm]);

  const stats = useMemo(() => {
    const totalLogs = logs.length;
    const uniqueRooms = new Set(logs.map((l) => l.roomNo)).size;
    const undeliveredCount = logs.filter(
      (l) => l.callType === "guest" && !l.remarks,
    ).length;
    const typeCounts: Record<string, number> = {};
    logs.forEach((log) => {
      const type = log.callType || "guest";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    const avgRequests =
      uniqueRooms > 0 ? (totalLogs / uniqueRooms).toFixed(1) : "0.0";
    return {
      totalLogs,
      uniqueRooms,
      avgRequests,
      undeliveredCount,
      typeCounts,
    };
  }, [logs]);

  const guestRequestCountsByType = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    const logsByType = filteredLogs.reduce(
      (acc, log) => {
        const type = log.callType || "guest";
        if (!acc[type]) acc[type] = [];
        acc[type].push(log);
        return acc;
      },
      {} as Record<string, CallLog[]>,
    );

    Object.entries(logsByType).forEach(([type, typeLogs]) => {
      counts[type] = parseGuestRequests(typeLogs);
    });
    return counts;
  }, [filteredLogs]);

  const handleAdd = useCallback(
    async (newEntry: any) => {
      const id = crypto.randomUUID();
      const log: CallLog = {
        ...newEntry,
        id,
        timeOfRequest: formatTimeHHMMH(),
        remarks: newEntry.remarks || "",
        followUp: 0,
        acknowledgedBy: "",
        createdAt: Date.now(),
        callType: newEntry.callType || "guest",
        userId: profile?.id,
        dateId: currentDateId,
      };

      setLogs((prev) => [...prev, log]);
      try {
        await addLog(log, sessionDate, sessionShift as any);
        toast.success(`Entry added for RM ${log.roomNo}`);
      } catch (error) {
        toast.error("Failed to save to database");
      }
    },
    [profile, sessionDate, sessionShift, currentDateId],
  );

  const handleUpdate = useCallback(
    async (id: string, field: keyof CallLog, value: string | number) => {
      let updatedLogValue: any = null;
      setLogs((prev) =>
        prev.map((log) => {
          if (log.id === id) {
            if (log[field] === value) return log;
            const updated = { ...log, [field]: value };
            if (field === "remarks" && !updated.timeOfDelivered) {
              updated.timeOfDelivered = formatTimeHHMMH();
            }
            updatedLogValue = updated;
            return updated;
          }
          return log;
        }),
      );

      if (updatedLogValue) {
        try {
          await updateLog(id, { [field]: value });
          toast.success("Updated");
        } catch (error) {
          toast.error("Failed to update database");
        }
      }
    },
    [],
  );

  const handleConfirmClear = useCallback(async () => {
    setLogs([]);
    setIsPrivacyMode(false);
    setShowTerms(true);
    try {
      await clearAllLogs();
      await updateSettings({ privacy_mode: false, terms_accepted: false });
      setIsModalOpen(false);
      toast.error("System Reset");
    } catch (error) {
      toast.error("Failed to reset system data");
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    try {
      await deleteLog(id);
      toast.info("Entry deleted");
    } catch (error) {
      toast.error("Failed to delete from database");
    }
  }, []);

  const exportToExcel = useCallback(() => {
    if (logs.length === 0) return;
    const data = logs.map((log) => ({
      "Requested By": log.requestedBy,
      "Last Name": log.lastName,
      "Room No.": log.roomNo,
      "Guest Req": log.guestReq,
      "Time of Request": log.timeOfRequest,
      "Time of Delivered": log.timeOfDelivered,
      Remarks: log.remarks,
      "Follow up": log.followUp,
      "Ack By": log.acknowledgedBy,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Call Logs");
    XLSX.writeFile(
      wb,
      `Telex_Logs_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  }, [logs]);

  const copyExcel = useCallback(() => {
    if (logs.length === 0) return;
    const rows = logs
      .map(
        (log) =>
          `${log.requestedBy}\t${log.lastName}\t${log.roomNo}\t${log.guestReq}\t${log.timeOfRequest}\t${log.timeOfDelivered}\t${log.remarks}\t${log.followUp}`,
      )
      .join("\n");
    navigator.clipboard.writeText(rows).then(() => {
      setExcelCopySuccess(true);
      toast.success("Excel Format Copied");
      setTimeout(() => setExcelCopySuccess(false), 2000);
    });
  }, [logs]);

  const copyTableToClipboard = useCallback(() => {
    const text = logs
      .map(
        (log) =>
          `${formatFullTimestamp(new Date(log.createdAt))} hi ${log.roomNo} ${log.lastName} ${log.guestReq}`,
      )
      .join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      toast.success("Copied to Notepad");
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }, [logs]);

  const copyViberFormat = useCallback(() => {
    const guestLogs = logs.filter((log) => log.callType === "guest");
    const text = guestLogs
      .map(
        (log) =>
          `hi ${log.roomNo} ${log.lastName} ${log.guestReq} ${log.remarks} // ${(profile?.username || "ADMIN").toUpperCase()}`,
      )
      .join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setViberCopySuccess(true);
      toast.success("Copied to Viber");
      setTimeout(() => setViberCopySuccess(false), 2000);
    });
  }, [logs, profile]);

  const copyTotals = useCallback(() => {
    const typeLabels: Record<string, string> = {
      guest: "GUEST REQ",
      maintenance: "MAINTENANCE",
      housekeeping: "HK REQ",
      laundry: "LAUNDRY",
      booking_confirmation: "BOOKING CONF",
    };
    const text = Object.entries(guestRequestCountsByType)
      .filter(([_, counts]) => Object.keys(counts).length > 0)
      .map(([type, counts]) => {
        const typeLabel = typeLabels[type] || type.toUpperCase();
        const itemText = Object.entries(counts)
          .map(([item, count]) => `${count}${item.toUpperCase()}`)
          .join(",");
        return `[${typeLabel}]\n${itemText}`;
      })
      .join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      setCountsCopySuccess(true);
      toast.success("Totals Copied");
      setTimeout(() => setCountsCopySuccess(false), 2000);
    });
  }, [guestRequestCountsByType]);

  const handleLogout = useCallback(async () => {
    await authLogout();
  }, []);

  if (!isClient) return null;
  if (!profile) return null;

  if (profile.status === "unverified") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 max-w-md w-full"
        >
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Plus className="text-amber-500 w-12 h-12 rotate-45" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
            Account Pending
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            Welcome,{" "}
            <span className="text-slate-900 font-bold">{profile.username}</span>
            . Your account is currently waiting to be verified by a Duty
            Manager.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Status
              </p>
              <p className="text-amber-600 font-bold uppercase text-xs tracking-tighter">
                Waiting for Approval
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-4 text-slate-400 font-bold hover:text-red-500 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <SecurityGuard
        isPrivacyMode={isPrivacyMode}
        onDisablePrivacy={() => togglePrivacyMode(false)}
      >
        <NavShell
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onReset={() => setIsModalOpen(true)}
          isPrivacyMode={isPrivacyMode}
          setIsPrivacyMode={(val) => {
            if (!val && isPrivacyMode) setShowPrivacyModal(true);
            else togglePrivacyMode(val);
          }}
          profile={profile}
        >
          <div className="p-4 md:p-8 w-auto mx-auto space-y-8 animate-in fade-in duration-500">
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <header>
                  <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
                    Operational Overview
                  </h1>
                  <p className="text-muted-foreground font-medium">
                    Daily performance metrics and analytics.
                  </p>
                </header>
                <DashboardStats stats={stats} />
              </div>
            )}

            {activeTab === "archive" && <Archive />}

            {activeTab === "counter" && (
              <RequestCounter
                countsByType={guestRequestCountsByType}
                onCopyTotals={copyTotals}
                copyState={countsCopySuccess}
              />
            )}

            {activeTab === "users" && <UserManagement />}

            {activeTab === "monitoring" && (
              <div className="space-y-8">
                {/* Session Manager */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 leading-none mb-1 uppercase tracking-tight">
                        Active Session
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Logs will be saved to this date/shift
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <input
                      type="date"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="bg-white px-4 py-2 rounded-xl text-xs font-black outline-none border border-slate-100 shadow-sm focus:border-indigo-500/30 transition-all"
                    />
                    <div className="h-6 w-px bg-slate-200 mx-1" />
                    <div className="flex p-1 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <button
                        onClick={() => setSessionShift("AM")}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                          sessionShift === "AM"
                            ? "bg-amber-500 text-white shadow-lg"
                            : "text-slate-400 hover:text-slate-600",
                        )}
                      >
                        AM
                      </button>
                      <button
                        onClick={() => setSessionShift("PM")}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                          sessionShift === "PM"
                            ? "bg-indigo-600 text-white shadow-lg"
                            : "text-slate-400 hover:text-slate-600",
                        )}
                      >
                        PM
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSessionLoading ? (
                      <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    ) : currentDateId ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100">
                        <Check size={14} />
                        Synced
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100">
                        Connecting...
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm font-black text-primary uppercase tracking-widest">
                    <Plus size={16} strokeWidth={3} />
                    Quick Add Log
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <AddEntry onAdd={handleAdd} />
                  </div>

                  <div className="lg:w-80 flex flex-col gap-4">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
                        <button
                          onClick={() => setFilterType("all")}
                          className={cn(
                            "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                            filterType === "all"
                              ? "bg-white text-primary shadow-sm"
                              : "text-slate-400 hover:text-slate-600",
                          )}
                        >
                          All Logs
                        </button>
                        <button
                          onClick={() => setFilterType("undelivered")}
                          className={cn(
                            "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5",
                            filterType === "undelivered"
                              ? "bg-white text-red-500 shadow-sm"
                              : "text-slate-400 hover:text-slate-600",
                          )}
                        >
                          Undelivered
                          {stats.undeliveredCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-red-50 text-[9px] font-black">
                              {stats.undeliveredCount}
                            </span>
                          )}
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search Room or Guest..."
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:border-primary outline-none transition-all"
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300">
                          <Plus size={16} className="rotate-45" />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={copyExcel}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest",
                          excelCopySuccess
                            ? "bg-emerald-500 text-white shadow-lg"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md",
                        )}
                      >
                        {excelCopySuccess ? (
                          <Check size={14} />
                        ) : (
                          <FileText size={14} />
                        )}
                        Excel
                      </button>
                      <button
                        onClick={copyTableToClipboard}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest",
                          copySuccess
                            ? "bg-slate-800 text-white shadow-lg"
                            : "bg-slate-700 text-white hover:bg-slate-800 shadow-md",
                        )}
                      >
                        {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                        Text
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={copyViberFormat}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest",
                          viberCopySuccess
                            ? "bg-[#7360f2] text-white shadow-lg"
                            : "bg-[#6251d1] text-white hover:bg-[#5241b1] shadow-md",
                        )}
                      >
                        {viberCopySuccess ? (
                          <Check size={14} />
                        ) : (
                          <MessageCircle size={14} />
                        )}
                        Viber
                      </button>
                      <button
                        onClick={exportToExcel}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg"
                      >
                        <Download size={14} />
                        File
                      </button>
                    </div>
                  </div>
                </div>

                <MonitoringTable
                  data={filteredLogs}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  isPrivacyMode={isPrivacyMode}
                  currentUser={profile?.username || "admin"}
                />
              </div>
            )}

            <footer className="pt-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
              © 2026 Telex Management Systems • Efficiency & Hospitality
            </footer>
          </div>
        </NavShell>
      </SecurityGuard>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmClear}
        title="Reset All Data?"
        message="This will permanently delete all call logs for today."
        confirmText="Yes, Reset"
        requirePassword={true}
      />

      <TermsModal isOpen={showTerms} onAccept={handleAcceptTerms} />
      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onConfirm={() => togglePrivacyMode(false)}
      />
    </>
  );
}
