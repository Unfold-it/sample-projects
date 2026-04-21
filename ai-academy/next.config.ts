import type { NextConfig } from "next";

const config: NextConfig = {
  // Suppress "use client" hydration warnings in dev
  reactStrictMode: true,
};

export default config;
