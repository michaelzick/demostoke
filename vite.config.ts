import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ command, mode, ssrBuild }) => {
  const isLocalhost =
    process.env.HOSTNAME === 'localhost' ||
    process.env.NODE_ENV === 'development';

  // ✅ SSR BUILD
  if (ssrBuild) {
    return {
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
      build: {
        outDir: 'dist/server',
        ssr: 'src/entry-server.tsx',
        rollupOptions: {
          input: 'src/entry-server.tsx',
        },
      },
    };
  }

  // ✅ CLIENT BUILD
  return {
    server: {
      host: '::',
      port: isLocalhost ? 4050 : 8080,
    },
    plugins: [react(), mode === 'development' && componentTagger()].filter(
      Boolean,
    ),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist/client',
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
      },
    },
  };
});
