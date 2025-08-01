
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // Check if running on localhost
  const isLocalhost = process.env.HOSTNAME === "localhost" || process.env.NODE_ENV === "development";
  
  // Check if this is an SSR build
  const isSSRBuild = process.env.SSR === 'true';

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: isSSRBuild ? 'dist/server' : 'dist/client',
      ssr: isSSRBuild ? 'src/entry-server.tsx' : undefined,
    },
  };
});
