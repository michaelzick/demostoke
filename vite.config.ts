import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, ssrBuild }) => {
  // Check if running on localhost
  const isLocalhost = process.env.HOSTNAME === "localhost" || process.env.NODE_ENV === "development";

  return {
    server: {
      host: "::",
      port: isLocalhost ? 4050 : 8080, // Use port 4050 for localhost, 8080 otherwise
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
      outDir: ssrBuild ? 'dist/server' : 'dist/client',
      ssr: ssrBuild ? 'src/entry-server.tsx' : undefined,
    },
  };
});
