"use client";

import { format, isToday, isSameDay, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarDays, Clock3, Tag } from "lucide-react";
import type { CalendarEvent } from "@/types/calendar";
import { CATEGORY_META } from "@/types/calendar";

export function AgendaView({ events, onEvent }: {
  events: CalendarEvent[];
  onEvent: (event: CalendarEvent) => void;
}) {
  const today = startOfDay(new Date());
  const upcoming = events.filter(event => new Date(event.end).getTime() >= today.getTime())
    .sort((a, b) => a.start.localeCompare(b.start));

  if (!upcoming.length) return (
    <div className="calendar-panel flex min-h-72 flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-500"><CalendarDays size={26} /></div>
      <h2 className="font-semibold">Пока ничего не запланировано</h2>
      <p className="mt-2 max-w-sm text-sm calendar-muted">Добавьте событие, чтобы увидеть его в повестке.</p>
    </div>
  );

  return <div className="space-y-6">
    {upcoming.map((event, index) => {
      const start = new Date(event.start);
      const meta = CATEGORY_META[event.category];
      const previous = upcoming[index - 1];
      const newDay = !previous || !isSameDay(start, new Date(previous.start));
      return <div key={event.id}>
        {newDay && <h3 className="mb-3 text-sm font-semibold capitalize calendar-muted">
          {isToday(start) ? "Сегодня" : format(start, "EEEE, d MMMM", { locale: ru })}
        </h3>}
        <button onClick={() => onEvent(event)} className="calendar-panel flex w-full items-start gap-4 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="mt-1 h-12 w-1 shrink-0 rounded-full" style={{ background: meta.color }} />
          <div className="min-w-0 flex-1">
            <div className="font-medium">{event.title || "Без названия"}</div>
            {event.description && <p className="mt-1 text-sm calendar-muted">{event.description}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs calendar-muted">
              <span className="flex items-center gap-1"><Clock3 size={13} />{event.allDay ? "Весь день" : `${format(start, "HH:mm")} – ${format(new Date(event.end), "HH:mm")}`}</span>
              <span className="flex items-center gap-1"><Tag size={13} />{meta.label}</span>
              {event.tags.map(tag => <span key={tag} className="rounded-md bg-[var(--panel-muted)] px-2 py-1">{tag}</span>)}
            </div>
          </div>
        </button>
      </div>;
    })}
  </div>;
}
