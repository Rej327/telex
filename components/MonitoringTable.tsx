"use client";

import React from 'react';
import { CallLog } from '@/types';
import { cn, hhmmhToInputTime, inputTimeToHHMMH } from '@/lib/utils';
import { Trash2, MessageCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatFullTimestamp } from '@/lib/utils';

interface MonitoringTableProps {
  data: CallLog[];
  onUpdate: (id: string, field: keyof CallLog, value: string | number) => void;
  onDelete: (id: string) => void;
  isPrivacyMode?: boolean;
  currentUser: "cly" | "ann";
}


const MonitoringTableComponent: React.FC<MonitoringTableProps> = ({ 
  data,
  onUpdate, 
  onDelete,
  isPrivacyMode = false,
  currentUser
}) => {


  const privacyBlur = isPrivacyMode ? "blur-md select-none hover:blur-none transition-all duration-300" : "";

  return (

    <div className="w-full overflow-x-auto rounded-xl luxury-shadow glass border border-border/50">
      <table className="w-full text-left border-collapse min-w-[1100px]">
        <thead>
          <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
            <th className="p-4 font-bold text-xs uppercase tracking-widest">Requested By</th>
            <th className="p-4 font-bold text-xs uppercase tracking-widest">Type</th>
            <th className="p-4 font-bold text-xs uppercase tracking-widest">Room No.</th>
            <th className="p-4 font-bold text-xs uppercase tracking-widest">Last Name</th>
            <th className="p-4 font-bold text-xs uppercase tracking-widest">Guest Req</th>
            <th className="p-4 font-bold text-xs uppercase tracking-widest">Time of Request</th>
            <th className="p-4 font-bold text-xs uppercase tracking-widest">Time of Delivered</th>
            <th className="p-4 font-bold text-xs uppercase tracking-widest">Remarks</th>
            <th className="p-4 font-bold text-xs uppercase tracking-widest text-center">Follow up</th>
            <th className="p-4 font-bold text-xs uppercase tracking-widest">Ack By</th>
            <th className="p-4 font-bold text-xs uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {data.map((log, index) => (
              <motion.tr
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "border-b transition-all duration-300 group",
                  (log.callType === 'guest' && !log.remarks)
                    ? "border-red-500/50 bg-red-50/20 shadow-[inset_4px_0_0_0_#ef4444]" 
                    : "border-border/30 hover:bg-muted/50"
                )}
              >
                <td className={cn("p-4", privacyBlur)}>
                  <EditableCell 
                    value={log.requestedBy} 
                    onSave={(val) => onUpdate(log.id, 'requestedBy', val)} 
                  />
                </td>

                <td className="p-4 text-center">
                  <EditableCell 
                    value={log.callType || "guest"} 
                    onSave={(val) => onUpdate(log.id, 'callType', val)} 
                    type="dropdown"
                    options={[
                      { value: 'guest', label: 'Guest Req' },
                      { value: 'res_in', label: 'Transfer (In)' },
                      { value: 'res_out', label: 'Transfer (Out)' },
                      { value: 'inq_in', label: 'Inq (In)' },
                      { value: 'inq_out', label: 'Inq (Out)' },
                      { value: 'booking_confirmation', label: 'Booking' }
                    ]}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter inline-block w-full",
                      log.callType === 'res_in' ? "bg-purple-100 text-purple-600" :
                      log.callType === 'res_out' ? "bg-pink-100 text-pink-600" :
                      log.callType === 'booking_confirmation' ? "bg-amber-100 text-amber-600" :
                      (log.callType === 'inq_in' || log.callType === 'inq_out') ? "bg-blue-100 text-blue-600" :
                      "bg-slate-100 text-slate-600"
                    )}
                  />
                </td>

                <td className={cn("p-4", privacyBlur)}>
                  <EditableCell 
                    value={log.roomNo} 
                    onSave={(val) => onUpdate(log.id, 'roomNo', val)} 
                  />
                </td>

                <td className={cn("p-4", privacyBlur)}>
                  <EditableCell 
                    value={log.lastName} 
                    onSave={(val) => onUpdate(log.id, 'lastName', val)} 
                  />
                </td>

                <td className={cn("p-4", privacyBlur)}>
                  <EditableCell 
                    value={log.guestReq} 
                    onSave={(val) => onUpdate(log.id, 'guestReq', val)} 
                    className="font-bold text-primary"
                  />
                </td>

                <td className="p-4 font-mono text-xs">
                  <EditableCell 
                    value={log.timeOfRequest} 
                    onSave={(val) => onUpdate(log.id, 'timeOfRequest', val)} 
                    type="time"
                  />
                </td>
                <td className="p-4 font-mono text-xs text-primary">
                  <EditableCell 
                    value={log.timeOfDelivered} 
                    onSave={(val) => onUpdate(log.id, 'timeOfDelivered', val)} 
                    type="time"
                  />
                </td>
                <td className="p-4">
                  <EditableCell 
                    value={log.remarks} 
                    onSave={(val) => onUpdate(log.id, 'remarks', val)} 
                    onEditStart={() => {
                      if (!log.timeOfDelivered) {
                        onUpdate(log.id, 'remarks', log.remarks || "");
                      }
                    }}
                  />
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onUpdate(log.id, 'followUp', Math.max(0, log.followUp - 1))}
                      className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center font-bold text-xs"
                      title="Decrease Follow-up"
                    >
                      -
                    </button>
                    <span className={cn(
                      "inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 font-bold",
                      log.followUp > 0 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110" 
                        : "bg-slate-50 text-slate-300"
                    )}>
                      {log.followUp}
                    </span>
                    <button
                      onClick={() => onUpdate(log.id, 'followUp', log.followUp + 1)}
                      className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 hover:bg-green-50 hover:text-green-600 transition-all flex items-center justify-center font-bold text-xs"
                      title="Increase Follow-up"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="p-4">
                  <EditableCell 
                    value={log.acknowledgedBy} 
                    onSave={(val) => onUpdate(log.id, 'acknowledgedBy', val)} 
                    placeholder="---"
                    className="text-xs font-semibold uppercase italic"
                  />
                </td>
                <td className="p-4 text-right flex items-center justify-end gap-1">
                  <button
                    onClick={() => {
                      const prefix = (log.callType === 'res_out' || log.callType === 'inq_out') ? 'out' : 'hi';
                      const text = `${prefix} ${log.roomNo} ${log.lastName} ${log.guestReq} // ${currentUser.toUpperCase()}`;

                      navigator.clipboard.writeText(text);
                      toast.success("Entry Copied", {
                        description: `Viber format for RM ${log.roomNo} copied.`
                      });
                    }}

                    className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Copy for Viber"
                  >
                    <MessageCircle size={18} />
                  </button>
                  <button
                    onClick={() => {
                      const timestamp = formatFullTimestamp(new Date(log.createdAt));
                      const prefix = (log.callType === 'res_out' || log.callType === 'inq_out') ? 'out' : 'hi';
                      const text = `${timestamp} ${prefix} ${log.roomNo} ${log.lastName} ${log.guestReq}`;
                      navigator.clipboard.writeText(text);
                      toast.success("Notepad Format Copied", {
                        description: `Timestamped format for RM ${log.roomNo} copied.`
                      });
                    }}
                    className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    title="Copy for Notepad"
                  >
                    <FileText size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(log.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete Entry"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
          {data.length === 0 && (
            <tr>
              <td colSpan={10} className="p-12 text-center text-slate-400 italic font-medium">
                No active Telex logs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export const MonitoringTable = React.memo(MonitoringTableComponent);
MonitoringTable.displayName = 'MonitoringTable';

interface EditableCellProps {
  value: string;
  onSave: (value: string) => void;
  onEditStart?: () => void;
  className?: string;
  type?: 'text' | 'time' | 'dropdown';
  options?: { value: string; label: string }[];
  placeholder?: string;
}


const EditableCellComponent: React.FC<EditableCellProps> = ({ 
  value, 
  onSave, 
  onEditStart, 
  className, 
  type = 'text',
  options = [],
  placeholder = "---"
}) => {

  const [isEditing, setIsEditing] = React.useState(false);
  const [currentValue, setCurrentValue] = React.useState(value);

  const startEditing = () => {
    setIsEditing(true);
    if (onEditStart) onEditStart();
  };

  const handleBlur = () => {
    setIsEditing(false);
    // If it's a time picker, ensure we save in HHMMH format
    if (type === 'time') {
      onSave(inputTimeToHHMMH(currentValue));
    } else {
      onSave(currentValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (type === 'time') {
        onSave(inputTimeToHHMMH(currentValue));
      } else {
        onSave(currentValue);
      }
    }
    if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    if (type === 'time') {
      return (
        <input
          autoFocus
          type="time"
          value={hhmmhToInputTime(currentValue)}
          onChange={(e) => setCurrentValue(inputTimeToHHMMH(e.target.value))}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full bg-white border border-primary/50 rounded px-2 py-1 outline-none ring-1 ring-primary/30",
            className
          )}
        />
      );
    }

    if (type === 'dropdown') {
      return (
        <select
          autoFocus
          value={currentValue}
          onChange={(e) => {
            setCurrentValue(e.target.value);
            onSave(e.target.value);
            setIsEditing(false);
          }}
          onBlur={() => setIsEditing(false)}
          className={cn(
            "w-full bg-white border border-primary/50 rounded px-1 py-0.5 outline-none ring-1 ring-primary/30 text-[10px] font-black uppercase tracking-tighter",
            className
          )}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        autoFocus
        type="text"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full bg-white border border-primary/50 rounded px-2 py-1 outline-none ring-1 ring-primary/30",
          className
        )}
      />
    );

  }

  const displayValue = type === 'dropdown' 
    ? options.find(opt => opt.value === value)?.label || value
    : value;

  return (
    <div 
      onClick={startEditing}
      className={cn("cursor-pointer hover:text-primary transition-colors min-h-[1.5rem]", className)}
    >
      {displayValue || <span className="text-slate-300 italic">{placeholder}</span>}
    </div>
  );

};

const EditableCell = React.memo(EditableCellComponent);
EditableCell.displayName = 'EditableCell';
