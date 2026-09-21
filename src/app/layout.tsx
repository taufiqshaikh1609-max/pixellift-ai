import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelLift AI — Prompt based Image Upscaler",
  description:
    "Blurry images ko 8x tak upscale karein. Prompt likhein aur AI engine denoise, sharpening, color aur tone khud adjust karega.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-100 antialiased">{children}</body>
    </html>
  );
}
