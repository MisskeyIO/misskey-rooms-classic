import "./style.css";
import { createApp } from "vue";
import App from "./App.vue";
import AuthCallback from "./AuthCallback.vue";

const root = location.pathname === "/auth/callback" ? AuthCallback : App;

const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

function syncThemeFromSystem() {
  document.documentElement.dataset.theme = colorSchemeQuery.matches ? "dark" : "light";
}

syncThemeFromSystem();
colorSchemeQuery.addEventListener("change", syncThemeFromSystem);

createApp(root).mount("#app");
