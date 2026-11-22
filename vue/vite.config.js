import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { copyFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

// GitHub Pages no conoce las rutas de Vue Router: si alguien recarga en
// /vue/destinos, Pages busca 404.html. Copiamos index.html como 404.html
// para que la app cargue igual y el router muestre la vista correcta.
function copiar404() {
  return {
    name: "copiar-404",
    closeBundle() {
      copyFileSync("dist/index.html", "dist/404.html");
    }
  };
}

export default defineConfig({
  // La app se publica en https://alexchat159.github.io/Cordoba360-nuevo/vue/
  base: process.env.NODE_ENV === "production" ? "/Cordoba360-nuevo/vue/" : "/",
  plugins: [vue(), copiar404()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) }
  }
});
