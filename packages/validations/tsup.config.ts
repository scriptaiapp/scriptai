import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],
  format: ['cjs', 'esm'], // CJS for Nest.js, ESM for Next.js
  clean: true,            // Clean dist/
  sourcemap: true,        // Dev help
  external: ['zod'],      // External dependency (should not be bundled)
});

