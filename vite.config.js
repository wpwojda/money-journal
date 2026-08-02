import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  // GitHub Pages serves this repo from /money-journal/, a subpath, so assets
  // need that prefix - but only for that target. Local dev, Netlify, Vercel,
  // and Cloudflare Pages all serve from a root path, so base stays "/" unless
  // the GitHub Pages workflow explicitly sets GITHUB_PAGES=true.
  base: process.env.GITHUB_PAGES === "true" ? "/money-journal/" : "/",
  plugins: [react()],
}));
