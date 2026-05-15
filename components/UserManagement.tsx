"use client";

import React, { useEffect, useState, useCallback } from 'react';

import { getAllUsers, verifyUser } from '@/app/actions';
import { CheckCircle2, XCircle, Shield, User, Mail, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface UserRecord {
  id: string;
  email: string;
  username: string;
  type: 'dev' | 'manager' | 'telex';
  status: 'unverified' | 'verified';
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const refreshUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data as UserRecord[]);
    } catch (error) {
      toast.error('Failed to refresh users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function startFetching() {
      try {
        const data = await getAllUsers();
        if (!ignore) {
          setUsers(data as UserRecord[]);
        }
      } catch (error) {
        if (!ignore) toast.error('Failed to fetch users');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    startFetching();
    return () => {
      ignore = true;
    };
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    setActionId(userId);
    const newStatus = currentStatus === 'verified' ? 'unverified' : 'verified';
    try {
      await verifyUser(userId, newStatus);
      toast.success(`User ${newStatus === 'verified' ? 'verified' : 'unverified'} successfully`);
      await refreshUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setActionId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">User Management</h2>
          <p className="text-slate-500 font-medium text-sm">Review and verify portal access for team members.</p>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all w-full md:w-80 font-bold"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Member</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Role</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading members...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <p className="text-slate-400 font-bold text-sm">No users found matching your search.</p>
                    </td>
                  </tr>
                ) : filteredUsers.map((user) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={user.id} 
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 tracking-tight">{user.username}</p>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Mail size={12} />
                            <p className="text-xs font-medium">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        user.type === 'dev' ? 'bg-purple-50 text-purple-600' :
                        user.type === 'manager' ? 'bg-blue-50 text-blue-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        <Shield size={10} />
                        {user.type}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        user.status === 'verified' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${user.status === 'verified' ? 'bg-green-600' : 'bg-amber-600'}`} />
                        {user.status}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        disabled={actionId === user.id}
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${
                          user.status === 'verified' 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
                        }`}
                      >
                        {actionId === user.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : user.status === 'verified' ? (
                          <>
                            <XCircle size={14} />
                            Revoke
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} />
                            Verify
                          </>
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
