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
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('react-helmet-async')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('dompurify') || id.includes('marked') || id.includes('gray-matter') || id.includes('framer-motion')) {
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

          // Page chunks
          if (id.includes('/pages/vendor/')) {
            return 'pages-vendor';
          }
          if (id.includes('/pages/admin/')) {
            return 'pages-admin';
          }
          if (id.includes('/pages/Blog') || id.includes('/pages/AuthorPage')) {
            return 'pages-blog';
          }
          if (id.includes('/components/vendor/') || id.includes('/contexts/VendorContext')) {
            return 'components-vendor';
          }

          // Let other modules be auto-split
          return undefined;
        },
      },
    },
    // Increase chunk size warning limit since we're intentionally splitting
    chunkSizeWarningLimit: 500,
  },
});