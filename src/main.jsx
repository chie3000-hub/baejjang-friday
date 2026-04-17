import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../App.jsx";

// 古いサービスワーカーを強制削除してキャッシュをリセット
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
  });
  caches.keys().then(keys => {
    keys.forEach(key => caches.delete(key));
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
