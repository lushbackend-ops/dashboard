"use client";

import { useState } from 'react';
import { Calendar, Clock, Globe } from 'lucide-react';

interface DateTimePickerProps {
  value: string; // ISO UTC or local date string
  onChange: (utcIsoString: string, displayFormatted: string) => void;
  timezone?: string;
  error?: string | null;
}

export function DateTimePicker({
  value,
  onChange,
  timezone = 'Asia/Kolkata',
  error
}: DateTimePickerProps) {
  // Generate min date/time strings (today)
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Derive initial values: default to tomorrow 18:30 IST if not supplied
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const initDate = value ? value.split('T')[0] : tomorrowStr;
  const initTime = value && value.includes('T') ? value.split('T')[1].substring(0, 5) : '18:30';

  const [date, setDate] = useState(initDate);
  const [time, setTime] = useState(initTime);

  // Trigger default on initial load if not set
  useState(() => {
    if (!value && initDate && initTime) {
      const localCombined = `${initDate}T${initTime}:00+05:30`;
      const parsedUtc = new Date(localCombined);
      if (!isNaN(parsedUtc.getTime())) {
        onChange(
          parsedUtc.toISOString(),
          parsedUtc.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
          })
        );
      }
    }
  });

  const handleUpdate = (newDate: string, newTime: string) => {
    setDate(newDate);
    setTime(newTime);

    if (newDate && newTime) {
      // Parse local input as Asia/Kolkata offset (+05:30)
      const localCombined = `${newDate}T${newTime}:00+05:30`;
      const parsedUtc = new Date(localCombined);

      if (!isNaN(parsedUtc.getTime())) {
        const utcIso = parsedUtc.toISOString();
        const displayFormatted = parsedUtc.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'medium',
          timeStyle: 'short'
        });
        onChange(utcIso, displayFormatted);
      }
    }
  };

  return (
    <div className="space-y-3 bg-secondary/30 p-5 rounded-2xl border border-border/40">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Publication Schedule (Exact Date & Time)
        </label>
        <div className="flex items-center gap-1.5 text-xs text-secondary-foreground bg-card/60 px-2.5 py-1 rounded-full border border-border/40 shadow-xs">
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span>{timezone} (IST, UTC+5:30)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Date Selector */}
        <div>
          <label className="text-xs font-medium text-secondary-foreground block mb-1">
            Date
          </label>
          <div className="relative">
            <input
              type="date"
              min={todayStr}
              value={date}
              onChange={(e) => handleUpdate(e.target.value, time)}
              className="w-full bg-card border border-border/50 text-foreground text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer shadow-xs"
            />
          </div>
        </div>

        {/* Time Selector */}
        <div>
          <label className="text-xs font-medium text-secondary-foreground block mb-1">
            Time (IST)
          </label>
          <div className="relative">
            <input
              type="time"
              value={time}
              onChange={(e) => handleUpdate(date, e.target.value)}
              className="w-full bg-card border border-border/50 text-foreground text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer shadow-xs"
            />
          </div>
        </div>
      </div>

      {date && time && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs text-foreground flex items-center justify-between">
          <span className="text-secondary-foreground">Scheduled for:</span>
          <span className="font-semibold text-primary">
            {new Date(`${date}T${time}:00+05:30`).toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
              dateStyle: 'full',
              timeStyle: 'short'
            })}
          </span>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}
    </div>
  );
}
