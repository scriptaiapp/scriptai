import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['index.ts'],
  format: ['cjs', 'esm'],
  clean: true,
  sourcemap: true,
  external: ['@repo/supabase', '@repo/validation'],
});