import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react', 'src/data/tools.ts', 'src/data/toolDetails.ts', 'src/data/categoryTemplates.ts'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // Match theo tên package chính xác; `includes('react')` cũ bắt nhầm
            // lucide-react, react-i18next... gây circular chunk vendor-react <-> vendor-other
            const pkg = id.split(/node_modules[\\/]/).pop()!.split(/[\\/]/);
            const name = pkg[0].startsWith('@') ? `${pkg[0]}/${pkg[1]}` : pkg[0];

            if (['react', 'react-dom', 'scheduler', 'react-router', 'react-router-dom', '@remix-run/router', 'react-helmet-async', 'react-fast-compare', 'invariant', 'shallowequal', 'prop-types', 'react-is', 'object-assign'].includes(name)) {
              return 'vendor-react';
            }
            if (name.startsWith('@supabase/')) {
              return 'vendor-supabase';
            }
            if (name === 'lucide-react') {
              return 'vendor-icons';
            }
            if (['dompurify', 'marked', 'gray-matter', 'framer-motion', 'motion-dom', 'motion-utils'].includes(name)) {
              return 'vendor-utils';
            }
            return 'vendor-other';
          }

          // Data chunks - split large data files
          if (id.includes('/data/tools.ts')) {
            return 'data-tools';
          }
          if (id.includes('/data/toolDetails.ts')) {
            return 'data-tool-details';
          }
          if (id.includes('/data/categoryTemplates.ts')) {
            return 'data-category-templates';
          }
          if (id.includes('/data/courses.ts') || id.includes('/data/ebooks.ts') || id.includes('/data/blogPosts.ts')) {
            return 'data-content';
          }

          // Pages đã được lazy() trong App.tsx nên để Rollup tự tách;
          // gom thủ công sẽ kéo module dùng chung (supabase, useAuth) vào chunk trang
          // Let other modules be auto-split
          return undefined;
        },
      },
    },
    // Increase chunk size warning limit since we're intentionally splitting
    chunkSizeWarningLimit: 500,
  },
});