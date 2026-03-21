import { defineConfig } from "vite-plus";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  root: ".",
  plugins: [vue()],
  build: {
    outDir: "../../dist",
    rolldownOptions: {
      input: new URL("index.html", import.meta.url).pathname,
    },
  },
  server: {
    proxy: {
      "/rpc": "http://localhost:8787",
    },
  },
});
