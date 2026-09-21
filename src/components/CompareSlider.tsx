"use client";

import { useRef, useState } from "react";

type Props = {
  beforeSrc: string;
  afterSrc: string;
  aspect?: number;
};

export default function CompareSlider({ beforeSrc, afterSrc, aspect }: Props) {
  const [pos, setPos] = useState(50);
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = (clientX: number) => {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  };

  return (
    <div
      ref={boxRef}
      className="relative w-full select-none overflow-hidden rounded-2xl border border-white/10 bg-black/40"
      style={{ aspectRatio: aspect && aspect > 0 ? aspect : 16 / 10 }}
      onMouseDown={(e) => {
        dragging.current = true;
        move(e.clientX);
      }}
      onMouseMove={(e) => dragging.current && move(e.clientX)}
      onMouseUp={() => (dragging.current = false)}
      onMouseLeave={() => (dragging.current = false)}
      onTouchStart={(e) => move(e.touches[0].clientX)}
      onTouchMove={(e) => move(e.touches[0].clientX)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={beforeSrc}
        alt="Original"
        draggable={false}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ imageRendering: "pixelated" }}
      />
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterSrc}
          alt="Upscaled"
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-gradient-to-b from-cyan-300 via-white to-violet-400"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/15 text-xs text-white backdrop-blur">
          ⇄
        </div>
      </div>

      <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium tracking-wide text-white/80">
        AI UPSCALED
      </span>
      <span className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium tracking-wide text-white/60">
        ORIGINAL
      </span>
    </div>
  );
}
