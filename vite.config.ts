
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // Check if this is an SSR build. Vite doesn't expose ssrBuild in the ConfigEnv types
  // so rely on the SSR environment variable set when invoking the SSR build.
  // Detect SSR build. Some npm scripts call `vite build --ssr` without setting process.env.SSR,
  // so also check the process argv for the `--ssr` flag.
  const isSSRBuild = process.env.SSR === 'true' || process.argv.includes('--ssr');
  // Only apply manual chunking for client builds to avoid referencing externals (like react) during SSR
  const rollupOptions = !isSSRBuild
    ? {
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          },
        },
      }
    : undefined;

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
      sourcemap: true,
      // increase the warning limit to reduce noisy warnings for large bundles
      chunkSizeWarningLimit: 5000,
      // only provide rollupOptions for client builds
      ...(rollupOptions ? { rollupOptions } : {}),
  cssCodeSplit: true,
  // Use terser for production builds (keeps current behavior)
  minify: command === 'build' ? 'terser' : false,
    },
  };
});
