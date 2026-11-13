"use client";
// A 9:16 stage in Reel pixels: the card's drawing, its caption, and an optional label chip.
import { useEffect, useId, useRef, useState } from "react";
import type { Card } from "@/lib/content/types";
import { TEMPLATES } from "@/lib/motion/registry";
import { captionFrame } from "@/lib/motion/templates/caption";
import { fullZoomFrame } from "@/lib/motion/templates/fullZoom";
import { DRAWINGS } from "./drawings";
import { CaptionPill } from "./primitives";
import { subscribe, frozenTime } from "./clock";
import { LABEL_TONE } from "../labels";
import type { Label } from "@/lib/content/types";

const FPS = 30;

export function Stage({ card, badge, showDims = false }: { card: Card; badge?: string; showDims?: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const visible = useRef(false);
  const duration = TEMPLATES[card.template].duration(card.params, card.caption.length);
  const [frame, setFrame] = useState(() => Math.floor(0.8 * duration * FPS));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; });
    io.observe(el);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = subscribe((now) => {
      const frozen = frozenTime();
      if (frozen === null && (!visible.current || reduce.matches)) return;
      const t = frozen !== null ? Math.min(frozen, duration - 0.001) : now % duration;
      setFrame(Math.floor(t * FPS + 1e-6));
    });
    return () => { io.disconnect(); stop(); };
  }, [duration]);

  const t = frame / FPS;
  const Drawing = DRAWINGS[card.template];
  const captionIndex = card.template === "caption" ? captionFrame(card.params, t, card.caption.length).captionIndex
    : card.template === "fullZoom" ? fullZoomFrame(card.params, t).captionIndex : 0;
  const chunk = card.caption[Math.min(captionIndex, card.caption.length - 1)] ?? [];
  const mode = card.params.captionMode === "band" ? "band" : "bottom";

  return (
    <div ref={ref} className="relative aspect-[9/16] w-full max-w-full overflow-hidden rounded-[14px] bg-ground" style={{ containerType: "inline-size" }}>
      <svg viewBox="0 0 1080 1920" className="absolute inset-0 block h-full w-full" aria-hidden="true">
        <Drawing p={card.params} t={t} uid={uid} showDims={showDims} />
      </svg>
      {badge && (
        <span className={`absolute right-[3.5cqw] top-[3.5cqw] z-[3] whitespace-nowrap rounded-full font-semibold ${LABEL_TONE[badge as Label] ?? "bg-bar text-text"} ${badge === "Hiç kullanılmadı" ? "bg-[rgba(20,20,19,.82)]" : ""}`}
          style={{ fontSize: "4.1cqw", lineHeight: 1, padding: "2.2cqw 3.3cqw" }}>{badge}</span>
      )}
      {chunk.length > 0 && <CaptionPill chunk={chunk} mode={mode} p={card.params} />}
    </div>
  );
}
