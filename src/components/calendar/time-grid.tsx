"use client";

import { useEffect, useState } from "react";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { ru } from "date-fns/locale";
import type { CalendarEvent } from "@/types/calendar";
import { CATEGORY_META } from "@/types/calendar";

interface Props {
  date: Date;
  events: CalendarEvent[];
  mode: "week" | "day";
  onEvent: (event: CalendarEvent) => void;
  onSlot: (day: Date, hour: number) => void;
}

const HOUR_HEIGHT = 64;

export function TimeGrid({ date, events, mode, onEvent, onSlot }: Props) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const firstDay = mode === "day" ? date : startOfWeek(date, { weekStartsOn: 1 });
  const days = mode === "day" ? [firstDay] : Array.from({ length: 7 }, (_, i) => addDays(firstDay, i));
  const currentMinute = now.getHours() * 60 + now.getMinutes();

  return (
    <section className="calendar-panel overflow-auto">
      <div className="min-w-[650px]">
        <div className="sticky top-0 z-10 grid border-b border-[var(--line)] bg-[var(--panel)]"
          style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))` }}>
          <div />
          {days.map(day => (
            <div key={day.toISOString()} className={`border-l border-[var(--line)] py-3 text-center ${isSameDay(day, now) ? "text-indigo-500" : ""}`}>
              <div className="text-xs calendar-muted">{format(day, "EEE", { locale: ru })}</div>
              <div className="mt-1 text-lg font-semibold">{format(day, "d")}</div>
            </div>
          ))}
        </div>
        <div className="relative grid" style={{
          gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))`,
          height: 24 * HOUR_HEIGHT
        }}>
          <div>
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="relative border-b border-[var(--line)]" style={{ height: HOUR_HEIGHT }}>
                <span className="absolute -top-2 right-2 text-[10px] calendar-muted">{String(hour).padStart(2, "0")}:00</span>
              </div>
            ))}
          </div>
          {days.map(day => {
            const dayEvents = events.filter(event => !event.allDay && isSameDay(new Date(event.start), day));
            return (
              <div key={day.toISOString()} className="relative border-l border-[var(--line)]">
                {Array.from({ length: 24 }, (_, hour) => (
                  <button key={hour} aria-label={`Создать событие ${hour}:00`}
                    onClick={() => onSlot(day, hour)}
                    className="block w-full border-b border-[var(--line)]/70 hover:bg-indigo-500/5"
                    style={{ height: HOUR_HEIGHT }} />
                ))}
                {dayEvents.map(event => {
                  const start = new Date(event.start);
                  const end = new Date(event.end);
                  const startMinutes = start.getHours() * 60 + start.getMinutes();
                  const endMinutes = end.getHours() * 60 + end.getMinutes();
                  const top = startMinutes / 60 * HOUR_HEIGHT;
                  const height = Math.max(24, (endMinutes - startMinutes) / 60 * HOUR_HEIGHT);
                  const meta = CATEGORY_META[event.category];
                  return (
                    <button key={event.id} onClick={() => onEvent(event)} title={event.title}
                      className="absolute z-[2] w-[calc(100%-4px)] overflow-hidden rounded-md border-l-[3px] px-1.5 py-1 text-left text-[10px] sm:text-xs"
                      style={{ top, height: Math.min(height, 24 * HOUR_HEIGHT - top), left: 2, background: meta.background, borderLeftColor: meta.color, color: meta.color }}>
                      <div className="truncate font-semibold">{event.title || "Без названия"}</div>
                      <div>{format(start, "HH:mm")}–{format(end, "HH:mm")}</div>
                    </button>
                  );
                })}
                {isSameDay(day, now) && (
                  <div className="pointer-events-none absolute inset-x-0 z-[3] border-t-2 border-rose-500"
                    style={{ top: currentMinute / 60 * HOUR_HEIGHT }}>
                    <span className="absolute -left-1.5 -top-[5px] size-2.5 rounded-full bg-rose-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
