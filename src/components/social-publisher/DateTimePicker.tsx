"use client";

import { useState, useEffect } from 'react';
import { Calendar, Clock, Globe, Zap } from 'lucide-react';

interface DateTimePickerProps {
  value: string; // ISO UTC string
  onChange: (utcIsoString: string, displayFormatted: string) => void;
  timezone?: string;
  error?: string | null;
}

function getIstParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value || '';
  return {
    dateStr: `${get('year')}-${get('month')}-${get('day')}`,
    timeStr: `${get('hour')}:${get('minute')}`
  };
}

export function DateTimePicker({
  value,
  onChange,
  timezone = 'Asia/Kolkata',
  error
}: DateTimePickerProps) {
  const todayIst = getIstParts(new Date()).dateStr;

  // Initialize from value or default to tomorrow at 18:30 IST
  const getInitial = () => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return getIstParts(parsed);
      }
    }
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tomorrowIst = getIstParts(tomorrow).dateStr;
    return { dateStr: tomorrowIst, timeStr: '18:30' };
  };

  const initial = getInitial();
  const [date, setDate] = useState(initial.dateStr);
  const [time, setTime] = useState(initial.timeStr);

  const applySchedule = (newDate: string, newTime: string) => {
    setDate(newDate);
    setTime(newTime);

    if (newDate && newTime) {
      const istCombined = `${newDate}T${newTime}:00+05:30`;
      const utcDate = new Date(istCombined);

      if (!isNaN(utcDate.getTime())) {
        const utcIso = utcDate.toISOString();
        const displayFormatted = utcDate.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'medium',
          timeStyle: 'short'
        });
        onChange(utcIso, displayFormatted);
      }
    }
  };

  const setPreset = (offsetMinutes: number, fixedHour?: number, fixedMinute?: number) => {
    let target = new Date(Date.now() + offsetMinutes * 60 * 1000);
    if (typeof fixedHour === 'number') {
      const { dateStr } = getIstParts(target);
      const hourStr = fixedHour.toString().padStart(2, '0');
      const minStr = (fixedMinute || 0).toString().padStart(2, '0');
      applySchedule(dateStr, `${hourStr}:${minStr}`);
      return;
    }
    const { dateStr, timeStr } = getIstParts(target);
    applySchedule(dateStr, timeStr);
  };

  return (
    <div className="space-y-4 bg-secondary/30 p-5 rounded-2xl border border-border/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Publication Schedule (Exact Date & Time)
        </label>
        <div className="flex items-center gap-1.5 text-xs text-secondary-foreground bg-card/60 px-2.5 py-1 rounded-full border border-border/40 shadow-xs w-fit">
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span>{timezone} (IST, UTC+5:30)</span>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-secondary-foreground flex items-center gap-1 mr-1">
          <Zap className="w-3 h-3 text-amber-500" />
          Quick:
        </span>
        <button
          type="button"
          onClick={() => setPreset(15)}
          className="text-[11px] px-2.5 py-1 rounded-lg bg-card border border-border/60 hover:border-primary/50 text-foreground transition-all shadow-2xs"
        >
          +15 Mins
        </button>
        <button
          type="button"
          onClick={() => setPreset(60)}
          className="text-[11px] px-2.5 py-1 rounded-lg bg-card border border-border/60 hover:border-primary/50 text-foreground transition-all shadow-2xs"
        >
          +1 Hour
        </button>
        <button
          type="button"
          onClick={() => setPreset(24 * 60, 10, 0)}
          className="text-[11px] px-2.5 py-1 rounded-lg bg-card border border-border/60 hover:border-primary/50 text-foreground transition-all shadow-2xs"
        >
          Tomorrow 10 AM
        </button>
        <button
          type="button"
          onClick={() => setPreset(24 * 60, 18, 30)}
          className="text-[11px] px-2.5 py-1 rounded-lg bg-card border border-border/60 hover:border-primary/50 text-foreground transition-all shadow-2xs"
        >
          Tomorrow 6:30 PM
        </button>
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
              min={todayIst}
              value={date}
              onChange={(e) => applySchedule(e.target.value, time)}
              className="w-full bg-card border border-border/50 text-foreground text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer shadow-xs"
            />
          </div>
        </div>

        {/* Time Selector */}
        <div>
          <label className="text-xs font-medium text-secondary-foreground block mb-1">
            Time (IST, 24-Hour)
          </label>
          <div className="relative">
            <input
              type="time"
              value={time}
              onChange={(e) => applySchedule(date, e.target.value)}
              className="w-full bg-card border border-border/50 text-foreground text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer shadow-xs"
            />
          </div>
        </div>
      </div>

      {date && time && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs text-foreground flex items-center justify-between">
          <span className="text-secondary-foreground">Scheduled for (IST):</span>
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
