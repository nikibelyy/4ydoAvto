import type { Metadata, Viewport } from "next";
import { PWARegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Work Calendar — Рабочий календарь",
  description: "Ваше время. Ваш фокус. Ваш календарь.",
  applicationName: "Work Calendar",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Work Calendar" },
  manifest: "/manifest.json",
  formatDetection: { telephone: false }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#090a0d"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru" suppressHydrationWarning><body><PWARegister />{children}</body></html>;
}
