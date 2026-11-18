import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // GitHub Pages project site: https://adhivish.github.io/Shaffedits-website/
  // If you move to a custom domain (e.g. shaffedits.com), change this back to "/".
  base: "/Shaffedits-website/",
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
