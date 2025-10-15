import { defineConfig } from "vite";
import path from "path";

// Server build configuration for Netlify
export default defineConfig({
  build: {
    // Output to a new directory for bundled functions
    outDir: "netlify/functions-dist",
    ssr: true,
    lib: {
      // Use the existing Netlify function file as the entry point
      entry: "netlify/functions/api.ts",
      formats: ["es"],
      fileName: "api",
    },
    rollupOptions: {
      // By default, Vite will bundle all dependencies.
      // We don't need to specify externals.
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
      // Add an alias for the server directory to help Vite resolve it
      "server": path.resolve(__dirname, "./server"),
    },
  },
});