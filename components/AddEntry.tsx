"use client";

import React from "react";
import { parseSpaceSeparatedLine } from "@/lib/utils";
import { CallLog } from "@/types";
import { Keyboard } from "lucide-react";

interface AddEntryProps {
  onAdd: (
    entry: Omit<
      CallLog,
      "id" | "followUp" | "timeOfRequest" | "acknowledgedBy" | "createdAt"
    > & {
      callType:
        | "guest"
        | "res_in"
        | "res_out"
        | "inq_in"
        | "inq_out"
        | "booking_confirmation";
    },
  ) => void;
}

export const AddEntry: React.FC<AddEntryProps> = ({ onAdd }) => {
  const [input, setInput] = React.useState("");
  const [callType, setCallType] = React.useState<
    | "guest"
    | "res_in"
    | "res_out"
    | "inq_in"
    | "inq_out"
    | "booking_confirmation"
  >("guest");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!input.trim()) return;

    const parts = parseSpaceSeparatedLine(input);
    if (parts.length < 3) return;

    const requestedBy = parts[0] || "";

    // Find the index of the room number (usually the first numeric part after the name)
    // We start searching from index 1 (after requestedBy)
    let roomIndex = -1;
    for (let i = 1; i < parts.length; i++) {
      // Check if the part is numeric or looks like a room number (mostly digits)
      if (/^\d+[A-Z]?$/i.test(parts[i])) {
        roomIndex = i;
        break;
      }
    }

    let lastName = "";
    let roomNo = "";
    let guestReq = "";
    let timeOfDelivered = "";
    let remarks = "";

    if (roomIndex !== -1) {
      if (roomIndex === 1) {
        // Format: [Tag] [Room] [Name] [Request]
        // Example: hi 9912 dela.cruz 5bt
        roomNo = parts[roomIndex];
        lastName = (parts[roomIndex + 1] || "").replace(/\./g, " ");
        guestReq = parts.slice(roomIndex + 2).join(" ");
      } else {
        // Format: [Tag] [Name] [Room] [Request]
        // Example: hi dela.cruz 9912 5bt
        lastName = parts.slice(1, roomIndex).join(" ").replace(/\./g, " ");
        roomNo = parts[roomIndex];
        guestReq = parts.slice(roomIndex + 1).join(" ");
      }

      // Handle potential extra fields if needed (pos 4/5)
      const remaining = guestReq.split(" ");
      guestReq = (remaining[0] || "").replace(/\./g, " ");
      timeOfDelivered = remaining[1] || "";
      remarks = remaining.slice(2).join(" ");
    } else {
      // Fallback to old positional logic if no numeric room is found
      lastName = (parts[1] || "").replace(/\./g, " ");
      roomNo = parts[2] || "";
      guestReq = (parts[3] || "").replace(/\./g, " ");
      timeOfDelivered = parts[4] || "";
      remarks = parts.slice(5).join(" ");
    }

    const newLog: Omit<
      CallLog,
      "id" | "followUp" | "timeOfRequest" | "acknowledgedBy" | "createdAt"
    > & {
      callType:
        | "guest"
        | "res_in"
        | "res_out"
        | "inq_in"
        | "inq_out"
        | "booking_confirmation";
    } = {
      requestedBy,
      lastName,
      roomNo,
      guestReq,
      timeOfDelivered,
      remarks,
      callType,
    };

    onAdd(newLog);
    setInput("");
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap gap-2 mb-2">
        {(
          [
            "guest",
            "res_in",
            "res_out",
            "inq_in",
            "inq_out",
            "booking_confirmation",
          ] as const
        ).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setCallType(type)}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              callType === type
                ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                : "bg-white border border-border text-muted-foreground hover:bg-slate-50"
            }`}
          >
            {type === "guest"
              ? "Guest Req"
              : type === "res_in"
                ? "Transfer (In)"
                : type === "res_out"
                  ? "Transfer (Out)"
                  : type === "inq_in"
                    ? "Inq (In)"
                    : type === "inq_out"
                      ? "Inq (Out)"
                      : "Booking Conf"}
          </button>
        ))}
      </div>
      <div className="relative mt-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Type log details (e.g. "hi 9912 jonh.doe 5bt" or "hi 9912 jonh.doe 5.bt,.2.dk") and press Enter...'
          className="w-full h-24 p-4 rounded-xl glass border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all luxury-shadow resize-none text-sm"
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold pointer-events-none">
          <Keyboard size={14} />
          <span>Press Enter to append</span>
        </div>
      </div>

      <div className="text-[12px] text-muted-foreground italic px-1">
        Format: [Tag] [Room] [Name] [Request] (Tip: use dots for space like
        john.doe, in.room.dining)
      </div>
    </div>
  );
};
