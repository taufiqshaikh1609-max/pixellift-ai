import UpscalerStudio from "@/components/UpscalerStudio";

const FEATURES = [
  {
    icon: "🧠",
    title: "Prompt-driven enhance",
    body: "Aap likhein 'restore old photo, vivid colors' — engine prompt padhkar denoise, contrast, tone aur sharpening ka recipe khud banata hai.",
  },
  {
    icon: "🔍",
    title: "Upto 8x resolution",
    body: "Progressive Lanczos-3 resampling + adaptive unsharp mask, taaki edges pixelated na dikhein aur detail natural rahe.",
  },
  {
    icon: "⚡",
    title: "Seconds me result",
    body: "Server-side sharp pipeline (libvips) — koi queue nahi, koi watermark nahi. Direct full-resolution download.",
  },
  {
    icon: "🗂️",
    title: "History saved",
    body: "Har job PostgreSQL me metadata aur image ke saath store hoti hai, gallery se kabhi bhi wapas khol lijiye.",
  },
];

const STEPS = [
  { n: "01", t: "Upload", d: "Drag & drop ya file picker se apni image dein (12MB tak)." },
  { n: "02", t: "Prompt", d: "Style aur fix batayein — portrait, text scan, cinematic, B&W…" },
  { n: "03", t: "Upscale", d: "2x se 8x tak scale chunein aur AI enhance run karein." },
  { n: "04", t: "Download", d: "Before/after compare karein aur HD file save karein." },
];

const FAQ = [
  {
    q: "Prompt kaam kaise karta hai?",
    a: "Prompt ke keywords (sharp, denoise, vivid, portrait, restore, cinematic, text, anime, warm, B&W...) ek enhancement recipe me convert hote hain — brightness, saturation, contrast, median denoise, tint aur unsharp-mask strength us hisaab se set hoti hai.",
  },
  {
    q: "Kya meri image kahin bahar jaati hai?",
    a: "Nahi. Poora processing isi server par sharp/libvips se hota hai, aur result aapke apne PostgreSQL database me save rehta hai.",
  },
  {
    q: "Maximum output kya hai?",
    a: "Output ki lambi side 5000px tak jaati hai. Agar chuna gaya scale is limit ko cross kare to engine automatically best possible scale par clamp kar deta hai.",
  },
  {
    q: "Kaun se formats support hain?",
    a: "PNG, JPG, WEBP, AVIF, TIFF aur GIF. Transparency wali images PNG me, baaki high-quality JPEG me export hoti hain.",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        {/* NAV */}
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-lg font-black text-slate-950">
              ▲
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-white">PixelLift AI</p>
              <p className="text-[11px] text-white/45">prompt-based image upscaler</p>
            </div>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-white/60 md:flex">
            <a href="#studio" className="hover:text-white">Studio</a>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#how" className="hover:text-white">Kaise kaam karta hai</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <a
            href="#studio"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            Free me try karein
          </a>
        </header>

        {/* HERO */}
        <section className="py-12 text-center sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-xs text-violet-200">
            ✦ No signup · No watermark · 8x tak upscale
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl leading-tight font-black tracking-tight text-white sm:text-6xl">
            Blurry photo ko{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
              HD masterpiece
            </span>{" "}
            banaiye — sirf ek prompt se
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/60 sm:text-lg">
            Image upload karein, batayein kya chahiye — “sharp detail, denoise, vivid
            colors” — aur AI engine resolution badha kar detail, color aur tone sab
            theek kar deta hai.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#studio"
              className="rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-violet-900/40"
            >
              ✨ Abhi upscale karein
            </a>
            <a
              href="#how"
              className="rounded-2xl border border-white/15 px-7 py-3.5 text-sm font-semibold text-white/80 hover:bg-white/5"
            >
              Demo dekhein
            </a>
          </div>
          <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs text-white/45">
            <span>⚙️ Lanczos-3 + unsharp pipeline</span>
            <span>🖼️ PNG / JPG / WEBP / AVIF</span>
            <span>🔒 Images aapke server par</span>
          </div>
        </section>

        <UpscalerStudio />

        {/* FEATURES */}
        <section id="features" className="mt-20">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Kyun PixelLift AI?
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass rounded-3xl p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-xl">
                  {f.icon}
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW */}
        <section id="how" className="mt-20">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            4 step me HD result
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="glass rounded-3xl p-5">
                <p className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-3xl font-black text-transparent">
                  {s.n}
                </p>
                <h3 className="mt-2 text-base font-semibold text-white">{s.t}</h3>
                <p className="mt-1 text-sm text-white/55">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mt-20">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">FAQ</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {FAQ.map((f) => (
              <details key={f.q} className="glass group rounded-2xl p-5">
                <summary className="cursor-pointer list-none text-sm font-semibold text-white">
                  <span className="mr-2 text-cyan-300 group-open:hidden">＋</span>
                  <span className="mr-2 hidden text-violet-300 group-open:inline">−</span>
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="mt-20 border-t border-white/10 pt-8 text-center text-xs text-white/40">
          <p>PixelLift AI — Next.js + sharp + PostgreSQL par bana prompt-based upscaler.</p>
          <p className="mt-1">Made for creators · {new Date().getFullYear()}</p>
        </footer>
      </div>
    </main>
  );
}
