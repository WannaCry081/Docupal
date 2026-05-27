"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: Direction;
  once?: boolean;
}

const HIDDEN_TRANSLATE: Record<Direction, string> = {
  up: "translate-y-4",
  down: "-translate-y-4",
  left: "-translate-x-4",
  right: "translate-x-4",
  none: "",
};

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 500,
  direction = "up",
  once = true,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      style={{ transitionDuration: `${duration}ms`, transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all",
        visible
          ? "opacity-100 translate-x-0 translate-y-0"
          : cn("opacity-0", HIDDEN_TRANSLATE[direction]),
        className,
      )}
    >
      {children}
    </div>
  );
}
