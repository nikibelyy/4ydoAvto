"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { addDays, format, isSameDay, isSameMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Search, Sun, Moon, List, CalendarRange, Clock3, Download, Upload } from "lucide-react";
import { useEvents } from "@/hooks/use-events";
import { CATEGORY_META } from "@/types/calendar";
import type { CalendarEvent, CalendarView } from "@/types/calendar";
import { MonthView } from "@/components/calendar/month-view";
import { TimeGrid } from "@/components/calendar/time-grid";
import { AgendaView } from "@/components/calendar/agenda-view";
import { EventDialog } from "@/components/events/event-dialog";
import { useSwipe } from "@/hooks/use-swipe";

const VIEWS: { id: CalendarView; label: string }[] = [
  { id: "month", label: "Месяц" }, { id: "week", label: "Неделя" },
  { id: "day", label: "День" }, { id: "agenda", label: "Повестка" }
];

function makeEvent(date: Date): CalendarEvent {
  const start = new Date(date);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start); end.setHours(end.getHours() + 1);
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(), title: "", description: "", start: start.toISOString(),
    end: end.toISOString(), allDay: false, category: "work", priority: "medium",
    tags: [], createdAt: now, updatedAt: now
  };
}
function periodTitle(date: Date, view: CalendarView) {
  if (view === "day") return format(date, "d MMMM yyyy", { locale: ru });
  if (view === "week") {
    return `${format(startOfWeek(date, { weekStartsOn: 1 }), "d MMM", { locale: ru })} — ${format(endOfWeek(date, { weekStartsOn: 1 }), "d MMM yyyy", { locale: ru })}`;
  }
  return format(date, "LLLL yyyy", { locale: ru });
}
function downloadJSON(data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = "work-calendar-backup.json";
  anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function validateBackup(value: unknown): CalendarEvent[] {
  if (!value || typeof value !== "object" || !("version" in value) ||
      value.version !== 1 || !("events" in value) || !Array.isArray(value.events)) {
    throw new Error("Неверный формат резервной копии.");
  }
  const incoming = value.events as unknown[];
  if (incoming.length > 10000) throw new Error("В файле слишком много событий (максимум 10 000).");
  const valid = incoming.every((item) => {
    if (!item || typeof item !== "object") return false;
    const e = item as Partial<CalendarEvent>;
    return typeof e.id === "string" && e.id.length > 0 &&
      typeof e.title === "string" && e.title.length <= 160 &&
      typeof e.description === "string" && e.description.length <= 5000 &&
      typeof e.start === "string" && Number.isFinite(Date.parse(e.start)) &&
      typeof e.end === "string" && Number.isFinite(Date.parse(e.end)) &&
      Date.parse(e.end) > Date.parse(e.start) &&
      typeof e.allDay === "boolean" &&
      ["work", "meeting", "personal", "deadline"].includes(e.category ?? "") &&
      ["low", "medium", "high"].includes(e.priority ?? "") &&
      Array.isArray(e.tags) && e.tags.every(tag => typeof tag === "string") &&
      typeof e.createdAt === "string" && Number.isFinite(Date.parse(e.createdAt)) &&
      typeof e.updatedAt === "string" && Number.isFinite(Date.parse(e.updatedAt));
  });
  if (!valid) throw new Error("В файле обнаружены некорректные события.");
  const events = incoming as CalendarEvent[];
  if (new Set(events.map(e => e.id)).size !== events.length) throw new Error("В файле повторяются ID событий.");
  return events;
}

export default function CalendarApp() {
  const { events, loading, error, save, remove, importAll, reload } = useEvents();
  const [date, setDate] = useState(() => new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [showTools, setShowTools] = useState(false);

  const notify = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }, []);
  const changeDate = useCallback((direction: -1 | 1) => {
    setDate(current => {
      if (view === "day") return addDays(current, direction);
      if (view === "week") return addDays(current, direction * 7);
      const next = new Date(current); next.setDate(1); next.setMonth(next.getMonth() + direction); return next;
    });
  }, [view]);
  const swipeHandlers = useSwipe({ onSwipe: changeDate });
  const visibleEvents = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("ru");
    return events.filter(e => !q || [e.title, e.description, ...e.tags].some(v => v.toLocaleLowerCase("ru").includes(q)));
  }, [events, search]);

  async function handleSave(event: CalendarEvent) {
    await save(event); setEditing(null); notify("Событие сохранено");
  }
  async function handleDelete(id: string) {
    if (!window.confirm("Удалить это событие?")) return;
    await remove(id); setEditing(null); notify("Событие удалено");
  }
  async function handleImport(file?: File) {
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error("Размер файла превышает 10 МБ.");
      const incoming = validateBackup(JSON.parse(await file.text()) as unknown);
      if (!window.confirm(`Заменить текущие события данными из файла (${incoming.length})?`)) return;
      await importAll(incoming); notify("Резервная копия импортирована");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Ошибка импорта файла");
    }
  }

  return <div className={dark ? "dark min-h-screen" : "min-h-screen"}>
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[248px] shrink-0 border-r border-[var(--line)] p-5 md:flex md:flex-col">
          <div className="mb-9 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-indigo-600 text-white"><CalendarDays size={22} /></div>
            <div><div className="font-semibold tracking-tight">Work Calendar</div><div className="text-xs calendar-muted">Personal workspace</div></div>
          </div>
          <button onClick={() => setEditing(makeEvent(date))} className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 active:scale-[.98]"><Plus size={17} />Новое событие</button>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest calendar-muted">Представления</div>
          <nav className="space-y-1">{VIEWS.map(v => <button key={v.id} onClick={() => setView(v.id)} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${view === v.id ? "bg-indigo-500/10 text-indigo-500" : "hover:bg-[var(--panel-muted)]"}`}>{v.label}</button>)}</nav>
          <div className="mt-8 mb-3 text-xs font-semibold uppercase tracking-widest calendar-muted">Категории</div>
          <div className="space-y-3">{Object.entries(CATEGORY_META).map(([key, meta]) => <div key={key} className="flex items-center gap-2 text-sm"><span className="size-2.5 rounded-full" style={{ backgroundColor: meta.color }} />{meta.label}</div>)}</div>
          <div className="mt-auto space-y-2 pt-8">
            <button onClick={() => setDark(v => !v)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-[var(--panel-muted)]">{dark ? <Sun size={17} /> : <Moon size={17} />}{dark ? "Светлая тема" : "Тёмная тема"}</button>
            <button onClick={() => downloadJSON({ version: 1, exportedAt: new Date().toISOString(), events, settings: { theme: dark ? "dark" : "light", weekStartsOn: 1, timeFormat: "24h", defaultView: view } })} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-[var(--panel-muted)]"><Download size={17} />Экспорт JSON</button>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-[var(--panel-muted)]"><Upload size={17} />Импорт JSON<input type="file" accept=".json,application/json" className="hidden" onChange={e => { void handleImport(e.target.files?.[0]); e.currentTarget.value = ""; }} /></label>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--canvas)]/90 px-4 py-4 backdrop-blur-xl md:px-8">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3">
              <div className="min-w-0"><div className="text-xs calendar-muted">Рабочее пространство</div><h1 className="mt-1 truncate text-xl font-semibold capitalize tracking-tight md:text-2xl">{periodTitle(date, view)}</h1></div>
              <div className="flex items-center gap-2">
                <button aria-label="Предыдущий период" onClick={() => changeDate(-1)} className="grid size-10 place-items-center rounded-xl border border-[var(--line)] hover:bg-[var(--panel-muted)]"><ChevronLeft size={18} /></button>
                <button onClick={() => setDate(new Date())} className="hidden rounded-xl border border-[var(--line)] px-3 py-2 text-sm sm:block">Сегодня</button>
                <button aria-label="Следующий период" onClick={() => changeDate(1)} className="grid size-10 place-items-center rounded-xl border border-[var(--line)] hover:bg-[var(--panel-muted)]"><ChevronRight size={18} /></button>
                <button onClick={() => setEditing(makeEvent(date))} className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95" aria-label="Добавить событие"><Plus size={19} /></button>
              </div>
            </div>
            <div className="mx-auto mt-4 flex max-w-[1500px] flex-wrap items-center justify-between gap-3">
              <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--panel)] p-1">{VIEWS.map(v => <button key={v.id} onClick={() => setView(v.id)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm ${view === v.id ? "bg-indigo-500/10 text-indigo-500" : "calendar-muted hover:bg-[var(--panel-muted)]"}`}>{v.label}</button>)}</div>
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2 sm:max-w-xs"><Search size={16} className="calendar-muted shrink-0" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск событий..." className="min-w-0 w-full bg-transparent text-sm outline-none" /></div>
              <button className="rounded-lg p-2 md:hidden" aria-label="Настройки и импорт/экспорт" onClick={() => setShowTools(v => !v)}><List size={19} /></button>
            </div>
            {showTools && <div className="mt-3 flex flex-wrap gap-2 md:hidden">
              <button onClick={() => setDark(v => !v)} className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm">{dark ? "Светлая тема" : "Тёмная тема"}</button>
              <button onClick={() => downloadJSON({ version: 1, exportedAt: new Date().toISOString(), events, settings: { theme: dark ? "dark" : "light", weekStartsOn: 1, timeFormat: "24h", defaultView: view } })} className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm">Экспорт JSON</button>
              <label className="cursor-pointer rounded-lg border border-[var(--line)] px-3 py-2 text-sm">Импорт JSON<input type="file" accept=".json,application/json" className="hidden" onChange={e => { void handleImport(e.target.files?.[0]); e.currentTarget.value = ""; }} /></label>
            </div>}
          </header>
          <div className="mx-auto max-w-[1500px] p-3 pb-24 md:p-8" {...swipeHandlers}>
            {error && <div role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">{error}<button onClick={() => void reload()} className="ml-2 underline">Повторить</button></div>}
            {loading ? <div className="grid grid-cols-7 gap-2" aria-label="Загрузка календаря">{Array.from({ length: 35 }, (_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--panel-muted)]" />)}</div> :
              <AnimatePresence mode="wait"><motion.div key={`${view}-${format(date, "yyyy-MM-dd")}`} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: .18 }}>
                {view === "month" && <MonthView date={date} events={visibleEvents} onDay={day => { setDate(day); setView("day"); }} onEvent={setEditing} />}
                {(view === "week" || view === "day") && <TimeGrid date={date} events={visibleEvents} mode={view} onEvent={setEditing} onSlot={(day, hour) => { const next = makeEvent(day); const start = new Date(day); start.setHours(hour, 0, 0, 0); next.start = start.toISOString(); next.end = new Date(start.getTime() + 3600000).toISOString(); setEditing(next); }} />}
                {view === "agenda" && <AgendaView events={visibleEvents} onEvent={setEditing} />}
              </motion.div></AnimatePresence>}
          </div>
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-[var(--line)] bg-[var(--panel)]/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl md:hidden">
        {[{ id: "month" as const, icon: CalendarDays, label: "Месяц" }, { id: "week" as const, icon: CalendarRange, label: "Неделя" }, { id: "day" as const, icon: Clock3, label: "День" }, { id: "agenda" as const, icon: List, label: "Список" }].map(({ id, icon: Icon, label }) => <button key={id} onClick={() => setView(id)} className={`flex min-w-0 flex-col items-center gap-1 px-3 py-1.5 text-[11px] ${view === id ? "text-indigo-500" : "calendar-muted"}`}><Icon size={20} />{label}</button>)}
      </nav>
      {editing && <EventDialog event={editing} onClose={() => setEditing(null)} onSave={handleSave} onDelete={handleDelete} />}
      <AnimatePresence>{notice && <motion.div role="status" initial={{ opacity: 0, y: 16, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-5 py-3 text-sm shadow-xl md:bottom-6">{notice}</motion.div>}</AnimatePresence>
    </div>
  </div>;
}
