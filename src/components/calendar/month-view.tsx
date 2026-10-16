"use client";

import { addDays, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { ru } from "date-fns/locale";
import type { CalendarEvent } from "@/types/calendar";
import { CATEGORY_META } from "@/types/calendar";

interface Props {
  date: Date;
  events: CalendarEvent[];
  onDay: (date: Date) => void;
  onEvent: (event: CalendarEvent) => void;
}

export function MonthView({ date, events, onDay, onEvent }: Props) {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let day = start; day <= end; day = addDays(day, 1)) days.push(day);

  return (
    <section className="calendar-panel overflow-hidden">
      <div className="calendar-grid border-b border-[var(--line)]">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(label => (
          <div key={label} className="py-3 text-center text-xs font-medium calendar-muted">{label}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {days.map(day => {
          const dayEvents = events
            .filter(event => isSameDay(new Date(event.start), day))
            .sort((a, b) => a.start.localeCompare(b.start));
          const today = isSameDay(day, new Date());
          const inMonth = isSameMonth(day, date);
          return (
            <div key={day.toISOString()} className={`calendar-day ${!inMonth ? "opacity-40" : ""}`}>
              <button onClick={() => onDay(day)}
                aria-label={`Открыть ${format(day, "d MMMM", { locale: ru })}`}
                className={`mb-1 grid size-7 place-items-center rounded-full text-xs ${today ? "bg-indigo-600 font-semibold text-white" : ""}`}>
                {format(day, "d")}
              </button>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => {
                  const meta = CATEGORY_META[event.category];
                  return (
                    <button key={event.id} title={event.title} onClick={() => onEvent(event)}
                      className="flex w-full min-w-0 items-center gap-1.5 overflow-hidden rounded-md px-1 py-1 text-left text-[10px] sm:text-xs"
                      style={{ background: meta.background, color: meta.color }}>
                      <span className="size-1.5 shrink-0 rounded-full" style={{ background: meta.color }} />
                      <span className="calendar-event-label truncate">{event.title || "Без названия"}</span>
                    </button>
                  );
                })}
                {dayEvents.length > 3 && (
                  <button onClick={() => onDay(day)} className="text-[10px] calendar-muted">+ ещё {dayEvents.length - 3}</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
