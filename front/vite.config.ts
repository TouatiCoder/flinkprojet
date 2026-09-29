import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  base: "/", // Use '/' if deployed at root
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  optimizeDeps: {
    exclude: ["next"], // Exclude next from optimization since it's not used with Vite
    esbuildOptions: {
      target: "esnext",
    },
  },
  resolve: {
    dedupe: ["react", "react-dom"], // Prevent duplicate React instances
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: undefined, // Let Vite handle chunking
      },
    },
  },
});
