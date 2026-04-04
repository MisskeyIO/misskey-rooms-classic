import "./style.css";
import { createApp } from "vue";
import App from "./App.vue";
import AuthCallback from "./AuthCallback.vue";
import { loadAuthState } from "./composables/useAuth.ts";

const authState = loadAuthState();
const shouldRedirectToLogin = location.pathname === "/" && authState === null;

if (shouldRedirectToLogin) {
  location.replace(`/auth/login?return_to=${encodeURIComponent("/")}`);
}

const root = location.pathname === "/callback" ? AuthCallback : App;

const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

function syncThemeFromSystem() {
  document.documentElement.dataset.theme = colorSchemeQuery.matches ? "dark" : "light";
}

syncThemeFromSystem();
colorSchemeQuery.addEventListener("change", syncThemeFromSystem);

if (!shouldRedirectToLogin) {
  createApp(root).mount("#app");
}
