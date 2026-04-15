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
        display: "standalone",
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
        // アプリシェル（HTML/JS/CSS）はキャッシュ優先
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        // Supabase APIはネットワーク優先（リアルタイムデータ）
        runtimeCaching: [
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
