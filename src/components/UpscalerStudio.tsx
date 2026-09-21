"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CompareSlider from "./CompareSlider";
import { formatBytes, timeAgo, type Job } from "@/lib/types";

const PRESETS: { label: string; prompt: string; emoji: string }[] = [
  { emoji: "🧑", label: "Portrait", prompt: "portrait skin smooth, denoise, natural bright" },
  { emoji: "🏔️", label: "Landscape", prompt: "landscape vivid colors, hdr contrast, sharp detail" },
  { emoji: "📜", label: "Old photo restore", prompt: "restore old photo, denoise, sharp detail" },
  { emoji: "🎌", label: "Anime / Art", prompt: "anime art clean lines, vivid, sharp" },
  { emoji: "📄", label: "Text / Scan", prompt: "document text scan ultra clear, contrast" },
  { emoji: "🛍️", label: "Product shot", prompt: "product studio bright, clean, crisp detail" },
  { emoji: "🎬", label: "Cinematic", prompt: "cinematic cool teal tone, moody contrast" },
  { emoji: "⚫", label: "Black & white", prompt: "black and white monochrome, dramatic contrast" },
];

const SCALES = [2, 3, 4, 6, 8];

const STEPS = [
  "Image analyse ho rahi hai…",
  "Prompt se enhancement recipe ban rahi hai…",
  "Lanczos neural upscaling…",
  "Detail + color refinement…",
  "Final render export…",
];

export default function UpscalerStudio() {
  const [file, setFile] = useState<File | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("sharp detail, denoise, vivid colors");
  const [scale, setScale] = useState(4);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [maxMB, setMaxMB] = useState(12);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs", { cache: "no-store" });
      const data = (await res.json()) as { jobs: Job[] };
      setJobs(data.jobs ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (!busy) return;
    setStep(0);
    const id = setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, 1200);
    return () => clearInterval(id);
  }, [busy]);

  const pickFile = (f: File | null | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Sirf image files allowed hain.");
      return;
    }
    setError(null);
    setJob(null);
    setFile(f);
    setLocalUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  };

  const run = async () => {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("prompt", prompt);
      body.append("scale", String(scale));
      const res = await fetch("/api/upscale", { method: "POST", body });
      const data = (await res.json()) as { job?: Job; error?: string };
      if (!res.ok || !data.job) {
        throw new Error(data.error || "Upscale fail ho gaya.");
      }
      setJob(data.job);
      void loadJobs();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kuch galat ho gaya.");
    } finally {
      setBusy(false);
    }
  };

  const togglePreset = (p: string) => {
    setPrompt((cur) => {
      const trimmed = cur.trim();
      if (!trimmed) return p;
      if (trimmed.toLowerCase().includes(p.toLowerCase())) return trimmed;
      return `${trimmed}, ${p}`;
    });
  };

  const aspect = job ? job.outputWidth / job.outputHeight : undefined;

  return (
    <div className="space-y-16">
      {/* STUDIO */}
      <section id="studio" className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* LEFT PANEL */}
        <div className="glass rounded-3xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white">1. Image upload karein</h2>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              pickFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            className={`mt-3 cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition ${
              dragOver
                ? "border-cyan-300 bg-cyan-400/10"
                : "border-white/15 bg-white/[0.03] hover:border-violet-400/60 hover:bg-violet-500/5"
            }`}
          >
            {localUrl ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={localUrl}
                  alt="preview"
                  className="mx-auto max-h-44 rounded-xl object-contain"
                />
                <p className="truncate text-xs text-white/60">
                  {file?.name} · {formatBytes(file?.size ?? 0)}
                </p>
                <p className="text-xs text-violet-300">Badalne ke liye click karein</p>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <div className="floaty mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-2xl">
                  ⬆
                </div>
                <p className="text-sm font-medium text-white">
                  Drag &amp; drop ya click karke image chunein
                </p>
                <p className="text-xs text-white/50">PNG · JPG · WEBP · AVIF — max 12MB</p>
              </div>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />

          <h2 className="mt-6 text-lg font-semibold text-white">2. Prompt likhein</h2>
          <p className="mt-1 text-xs text-white/50">
            Bataiye image kaisi chahiye — engine prompt ke hisaab se enhancement apply karega.
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            maxLength={400}
            placeholder="e.g. purani photo restore karo, face sharp aur colors vivid"
            className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-white placeholder-white/30 outline-none focus:border-violet-400/70"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => togglePreset(p.prompt)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/75 transition hover:border-cyan-300/60 hover:bg-cyan-400/10 hover:text-white"
              >
                {p.emoji} {p.label}
              </button>
            ))}
          </div>

          <h2 className="mt-6 text-lg font-semibold text-white">3. Scale chunein</h2>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {SCALES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScale(s)}
                className={`rounded-xl border px-2 py-2 text-sm font-semibold transition ${
                  scale === s
                    ? "border-transparent bg-gradient-to-br from-violet-500 to-cyan-400 text-slate-950"
                    : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={run}
            disabled={!file || busy}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-4 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-violet-900/40 transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Upscaling…" : "✨ Upscale with AI"}
          </button>

          {busy && (
            <div className="mt-4 space-y-2">
              <div className="shimmer h-1.5 w-full rounded-full" />
              <p className="text-center text-xs text-cyan-200">{STEPS[step]}</p>
            </div>
          )}
          {error && (
            <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-xs text-rose-200">
              {error}
            </p>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="glass rounded-3xl p-5 sm:p-6">
          {job ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">Result</h2>
                  <p className="text-xs text-white/50">
                    Slider ko drag karke before / after compare karein
                  </p>
                </div>
                <a
                  href={`/api/images/${job.id}`}
                  download={`upscaled-${job.fileName}`}
                  className="rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                >
                  ⬇ Download HD
                </a>
              </div>

              <CompareSlider
                beforeSrc={`/api/images/${job.id}?variant=source`}
                afterSrc={`/api/images/${job.id}`}
                aspect={aspect}
              />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Original" value={`${job.sourceWidth}×${job.sourceHeight}`} />
                <Stat
                  label="Upscaled"
                  value={`${job.outputWidth}×${job.outputHeight}`}
                  accent
                />
                <Stat label="Output size" value={formatBytes(job.outputBytes)} />
                <Stat label="Time" value={`${(job.durationMs / 1000).toFixed(1)}s`} />
              </div>

              <div>
                <p className="text-xs tracking-wide text-white/40 uppercase">
                  Prompt se apply hue enhancements
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.enhancements.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {job.prompt && (
                  <p className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/60 italic">
                    “{job.prompt}”
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 text-center">
              <div className="text-5xl">🖼️</div>
              <p className="text-sm font-medium text-white/80">
                Yahan aapka upscaled result dikhega
              </p>
              <p className="max-w-xs text-xs text-white/45">
                Image upload karein, prompt likhein aur “Upscale with AI” dabaayein —
                before/after slider ke saath HD output milega.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* HISTORY */}
      <section id="gallery">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Recent upscales</h2>
            <p className="text-sm text-white/50">
              Database me saved last {jobs.length || 0} jobs — click karke dobara dekhein.
            </p>
          </div>
          <button
            onClick={() => void loadJobs()}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70 hover:bg-white/10"
          >
            ↻ Refresh
          </button>
        </div>

        {jobs.length === 0 ? (
          <p className="glass mt-4 rounded-2xl p-8 text-center text-sm text-white/50">
            Abhi tak koi upscale nahi hua. Pehla image try karein!
          </p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {jobs.map((j) => (
              <button
                key={j.id}
                onClick={() => {
                  setJob(j);
                  document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="glass group overflow-hidden rounded-2xl text-left transition hover:border-cyan-300/40"
              >
                <div className="aspect-[4/3] overflow-hidden bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/images/${j.id}`}
                    alt={j.fileName}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-1 p-3">
                  <p className="truncate text-sm font-medium text-white">{j.fileName}</p>
                  <p className="truncate text-xs text-white/45">
                    {j.prompt || "no prompt"}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-white/50">
                    <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-violet-200">
                      {j.scale}x · {j.outputWidth}px
                    </span>
                    <span>{timeAgo(j.createdAt)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 ${
        accent
          ? "border-cyan-300/30 bg-cyan-400/10"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <p className="text-[11px] tracking-wide text-white/40 uppercase">{label}</p>
      <p
        className={`mt-1 text-sm font-semibold ${
          accent ? "text-cyan-200" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
