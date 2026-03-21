import "./style.css";
import { createApp } from "vue";
import App from "./App.vue";
import AuthCallback from "./AuthCallback.vue";

const root = location.pathname === "/auth/callback" ? AuthCallback : App;

createApp(root).mount("#app");
