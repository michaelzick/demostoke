import { build } from 'esbuild';

// Node resolution is required for Express's legacy browser-field mappings.
// Browser bundling stubs iconv-lite streams even though Workers supports them.
await build({
  entryPoints: ['server/worker.js'],
  outfile: 'dist/worker/worker.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'es2022',
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire('/worker.js');" },
  minify: true,
  external: ['cloudflare:*'],
  loader: { '.html': 'text' },
  define: { 'process.env.NODE_ENV': '"production"' },
});
