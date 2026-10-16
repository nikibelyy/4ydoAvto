export type CalendarView = "month" | "week" | "day" | "agenda";
export type EventCategory = "work" | "meeting" | "personal" | "deadline";
export type EventPriority = "low" | "medium" | "high";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  allDay: boolean;
  category: EventCategory;
  priority: EventPriority;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CalendarSettings {
  theme: "light" | "dark" | "system";
  weekStartsOn: 0 | 1;
  timeFormat: "12h" | "24h";
  defaultView: CalendarView;
}

export interface CalendarBackup {
  version: 1;
  exportedAt: string;
  events: CalendarEvent[];
  settings: CalendarSettings;
}

export const DEFAULT_SETTINGS: CalendarSettings = {
  theme: "system",
  weekStartsOn: 1,
  timeFormat: "24h",
  defaultView: "month"
};

export const CATEGORY_META: Record<
  EventCategory,
  { label: string; color: string; background: string }
> = {
  work: { label: "Работа", color: "#818cf8", background: "rgba(99,102,241,.14)" },
  meeting: { label: "Встречи", color: "#38bdf8", background: "rgba(14,165,233,.14)" },
  personal: { label: "Личное", color: "#34d399", background: "rgba(16,185,129,.14)" },
  deadline: { label: "Дедлайн", color: "#fb7185", background: "rgba(244,63,94,.14)" }
};
