
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ command, isSsrBuild }) => {
  const isSSRBuild = Boolean(isSsrBuild);
  const rolldownOptions = !isSSRBuild
    ? {
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      }
    : undefined;

  return {
    server: {
      host: "::",
      port: Number(process.env.PORT) || 8080,
    },
    plugins: [react()],
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
      // only provide rolldownOptions for client builds
      ...(rolldownOptions ? { rolldownOptions } : {}),
      cssCodeSplit: true,
      // Use terser for production builds with console removal
      minify: command === 'build' ? 'terser' : false,
      terserOptions: command === 'build' ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      } : undefined,
    },
  };
});
