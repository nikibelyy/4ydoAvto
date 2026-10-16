import {
  addDays, addMonths, addWeeks, endOfMonth, endOfWeek, format,
  isValid, parseISO, startOfDay, startOfMonth, startOfWeek, subMonths, subWeeks
} from "date-fns";
import { ru } from "date-fns/locale";
import type { CalendarView } from "@/types/calendar";

export { addDays, isValid, parseISO };
export const ruLocale = ru;

export function safeDate(value: string | Date): Date | null {
  const date = typeof value === "string" ? parseISO(value) : value;
  return isValid(date) ? date : null;
}

export function getRange(date: Date, view: CalendarView, weekStartsOn: 0 | 1 = 1) {
  if (view === "day") {
    const start = startOfDay(date);
    return { start, end: addDays(start, 1) };
  }
  if (view === "week") {
    return {
      start: startOfWeek(date, { weekStartsOn }),
      end: endOfWeek(date, { weekStartsOn })
    };
  }
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

export function moveDate(date: Date, view: CalendarView, direction: -1 | 1): Date {
  if (view === "day") return addDays(date, direction);
  if (view === "week") return addWeeks(date, direction);
  return direction === 1 ? addMonths(date, 1) : subMonths(date, 1);
}

export function shiftWeek(date: Date, direction: -1 | 1): Date {
  return direction === 1 ? addWeeks(date, 1) : subWeeks(date, 1);
}

export function formatMonth(date: Date): string {
  return format(date, "LLLL yyyy", { locale: ru });
}
