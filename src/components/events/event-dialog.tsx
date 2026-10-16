"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2, Save } from "lucide-react";
import { CATEGORY_META } from "@/types/calendar";
import type { CalendarEvent, EventCategory, EventPriority } from "@/types/calendar";

function localInputValue(iso: string): string {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
function fromLocalInput(value: string): string {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) throw new Error("Некорректная дата.");
  return date.toISOString();
}

export function EventDialog({ event, onClose, onSave, onDelete }: {
  event: CalendarEvent;
  onClose: () => void;
  onSave: (event: CalendarEvent) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<CalendarEvent>(() => ({ ...event, tags: [...event.tags] }));
  const [tagsInput, setTagsInput] = useState(event.tags.join(", "));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  function update<K extends keyof CalendarEvent>(key: K, value: CalendarEvent[K]) {
    setDraft(current => ({ ...current, [key]: value }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const title = draft.title.trim();
    if (!title) { setError("Введите название события."); return; }
    if (title.length > 160 || draft.description.length > 5000) {
      setError("Название или описание слишком длинное."); return;
    }
    try {
      const start = fromLocalInput(localInputValue(draft.start));
      const end = fromLocalInput(localInputValue(draft.end));
      if (new Date(end) <= new Date(start)) { setError("Окончание должно быть позже начала."); return; }
      const now = new Date().toISOString();
      const next: CalendarEvent = {
        ...draft, title, description: draft.description.trim(), start, end,
        tags: [...new Set(tagsInput.split(",").map(tag => tag.trim()).filter(Boolean))],
        updatedAt: now
      };
      setBusy(true);
      await onSave(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить.");
    } finally { setBusy(false); }
  }

  async function deleteEvent() {
    setBusy(true); setError("");
    try { await onDelete(draft.id); }
    catch (err) { setError(err instanceof Error ? err.message : "Не удалось удалить."); }
    finally { setBusy(false); }
  }

  return <AnimatePresence>
    <motion.div className="fixed inset-0 z-40 flex items-end justify-center bg-black/45 backdrop-blur-sm sm:items-center sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onMouseDown={e => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <motion.form role="dialog" aria-modal="true" aria-labelledby="event-dialog-title" onSubmit={submit}
        initial={{ opacity: 0, y: 30, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: .98 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-2xl sm:rounded-3xl sm:p-7">
        <div className="mb-6 flex items-center justify-between">
          <div><h2 id="event-dialog-title" className="text-xl font-semibold">{draft.title ? "Редактировать событие" : "Новое событие"}</h2><p className="mt-1 text-sm calendar-muted">Запланируйте своё время</p></div>
          <button type="button" aria-label="Закрыть" onClick={onClose} disabled={busy} className="grid size-9 place-items-center rounded-xl hover:bg-[var(--panel-muted)]"><X size={19} /></button>
        </div>
        <div className="space-y-4">
          <label className="block"><span className="mb-2 block text-sm font-medium">Название</span>
            <input autoFocus required maxLength={160} value={draft.title} onChange={e => update("title", e.target.value)} placeholder="Например, планирование спринта" className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 outline-none" />
          </label>
          <label className="block"><span className="mb-2 block text-sm font-medium">Описание</span>
            <textarea maxLength={5000} rows={3} value={draft.description} onChange={e => update("description", e.target.value)} placeholder="Детали события..." className="w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3 outline-none" />
          </label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={draft.allDay} onChange={e => update("allDay", e.target.checked)} className="size-4 accent-indigo-600" />Весь день</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block"><span className="mb-2 block text-sm font-medium">Начало</span>
              <input required type="datetime-local" value={localInputValue(draft.start)} onChange={e => { try { update("start", fromLocalInput(e.target.value)); } catch { setError("Проверьте дату начала."); } }} className="w-full min-w-0 rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] px-2 py-3 text-sm" />
            </label>
            <label className="block"><span className="mb-2 block text-sm font-medium">Окончание</span>
              <input required type="datetime-local" value={localInputValue(draft.end)} onChange={e => { try { update("end", fromLocalInput(e.target.value)); } catch { setError("Проверьте дату окончания."); } }} className="w-full min-w-0 rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] px-2 py-3 text-sm" />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block"><span className="mb-2 block text-sm font-medium">Категория</span>
              <select value={draft.category} onChange={e => update("category", e.target.value as EventCategory)} className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] px-3 py-3">
                {Object.entries(CATEGORY_META).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}
              </select>
            </label>
            <label className="block"><span className="mb-2 block text-sm font-medium">Приоритет</span>
              <select value={draft.priority} onChange={e => update("priority", e.target.value as EventPriority)} className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] px-3 py-3">
                <option value="low">Низкий</option><option value="medium">Средний</option><option value="high">Высокий</option>
              </select>
            </label>
          </div>
          <label className="block"><span className="mb-2 block text-sm font-medium">Теги</span>
            <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} maxLength={500} placeholder="проект, команда, важно" className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3" />
            <span className="mt-1 block text-xs calendar-muted">Разделяйте теги запятыми.</span>
          </label>
        </div>
        {error && <p role="alert" className="mt-4 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-500">{error}</p>}
        <div className="mt-7 flex items-center justify-between gap-3">
          <button type="button" disabled={busy || !event.title} onClick={() => void deleteEvent()} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10 disabled:opacity-40"><Trash2 size={16} />Удалить</button>
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={onClose} className="rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm">Отмена</button>
            <button type="submit" disabled={busy} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"><Save size={16} />{busy ? "Сохранение…" : "Сохранить"}</button>
          </div>
        </div>
      </motion.form>
    </motion.div>
  </AnimatePresence>;
}
