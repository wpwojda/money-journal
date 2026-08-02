import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // Served from https://<user>.github.io/money-journal/ in production,
  // so assets need the repo name as a base path. Local dev still runs at "/".
  base: command === "build" ? "/money-journal/" : "/",
  plugins: [react()],
}));
