import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
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
        // アプリシェル（HTML/JS/CSS）はキャッシュ優先
        globPatterns: ["**/*.{js,css,ico,png,svg}"],
        runtimeCaching: [
          {
            // HTMLは常にネットワーク最新版を取得（キャッシュ古い問題を防ぐ）
            urlPattern: /\.html$/,
            handler: "NetworkFirst",
            options: { cacheName: "html-cache", networkTimeoutSeconds: 5 },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
    }),
  ],
});
