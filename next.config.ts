import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker / VPS deploy ke liye chhota self-contained server bundle banata hai.
  // Vercel / Railway par isse koi farak nahi padta.
  output: "standalone",
};

export default nextConfig;
