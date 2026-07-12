import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Plain client-rendered SPA (React Router). No SSR / nitro.
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['nonpolarizable-nonostensive-marylyn.ngrok-free.dev', '.ngrok-free.dev', 'all'],
  },
  // GLTF models are large; keep them out of the inline-asset path.
  assetsInclude: ["**/*.gltf", "**/*.glb", "**/*.hdr"],
});
