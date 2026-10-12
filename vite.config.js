import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages publishes this repository at /rabochiy-calendar/
  base: process.env.GITHUB_PAGES === 'true' ? '/rabochiy-calendar/' : '/',
  build: { outDir: 'dist' }
});
