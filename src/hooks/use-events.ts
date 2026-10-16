"use client";

import { useCallback, useEffect, useState } from "react";
import type { CalendarEvent } from "@/types/calendar";
import { eventStorage } from "@/lib/storage";

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEvents(await eventStorage.getAll());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить календарь.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const save = useCallback(async (event: CalendarEvent) => {
    setError(null);
    try {
      await eventStorage.put(event);
      setEvents(current => [...current.filter(item => item.id !== event.id), event]
        .sort((a, b) => a.start.localeCompare(b.start)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось сохранить событие.";
      setError(message);
      throw err;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setError(null);
    try {
      await eventStorage.remove(id);
      setEvents(current => current.filter(item => item.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось удалить событие.";
      setError(message);
      throw err;
    }
  }, []);

  const importAll = useCallback(async (next: CalendarEvent[]) => {
    setError(null);
    try {
      await eventStorage.replaceAll(next);
      setEvents([...next].sort((a, b) => a.start.localeCompare(b.start)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось импортировать данные.";
      setError(message);
      throw err;
    }
  }, []);

  return { events, loading, error, save, remove, importAll, reload };
}
