import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: "autoUpdate",
    includeAssets: ["icon-192.png", "icon-512.png"],
    manifest: {
      name: "배짱 Friday",
      short_name: "배짱 Friday",
      description: "배짱 크루 볼링 리그 관리",
      start_url: "/",
      display: "browser",
      background_color: "#06080f",
      theme_color: "#06080f",
      orientation: "portrait",
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    workbox: {
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true,
      navigateFallback: null,
      globPatterns: [],
      runtimeCaching: [
        {
          urlPattern: /^https?:\/\/.*/,
          handler: "NetworkFirst",
          options: { cacheName: "network-first", networkTimeoutSeconds: 5 },
        },
      ],
    },
  }), cloudflare()],
});