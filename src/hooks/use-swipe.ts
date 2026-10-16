"use client";

import { useRef } from "react";

export function useSwipe({
  onSwipe,
  threshold = 70
}: {
  onSwipe: (direction: -1 | 1) => void;
  threshold?: number;
}) {
  const start = useRef<{ x: number; y: number } | null>(null);

  return {
    onTouchStart(event: React.TouchEvent<HTMLElement>) {
      const touch = event.touches[0];
      start.current = { x: touch.clientX, y: touch.clientY };
    },
    onTouchEnd(event: React.TouchEvent<HTMLElement>) {
      if (!start.current) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.current.x;
      const dy = touch.clientY - start.current.y;
      start.current = null;
      if (Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.3) {
        onSwipe(dx < 0 ? 1 : -1);
      }
    },
    onTouchCancel() { start.current = null; }
  };
}
