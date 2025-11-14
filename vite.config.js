import { defineConfig } from "vite";
import restart from "vite-plugin-restart";

export default defineConfig({
  root: "src/", // Source files live here (includes index.html)
  publicDir: "../static/", // Static assets to be copied as-is during build

  server: {
    host: true, // Accessible via local network
    open: true, // Automatically opens browser on start
  },

  build: {
    outDir: "../dist", // Build output directory
    emptyOutDir: true, // Clears /dist before new build
    sourcemap: true, // Generates sourcemaps for debugging
  },

  plugins: [
    restart({
      restart: ["../static/**"], // Restart dev server when static assets change
    }),
  ],
});
