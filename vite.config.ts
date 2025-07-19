
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
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
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor libraries
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['@radix-ui/react-toast', '@radix-ui/react-dialog', '@radix-ui/react-popover'],
            'vendor-maps': ['mapbox-gl'],
            'vendor-charts': ['recharts'],
            'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
            // Split large components
            'analytics': ['src/pages/AnalyticsPage.tsx'],
            'maps': ['src/components/MapComponent.tsx', 'src/components/HybridView.tsx'],
          },
        },
      },
    },
  };
});
