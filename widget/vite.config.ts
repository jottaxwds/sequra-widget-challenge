import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isLibraryBuild = mode === 'library' || process.env.BUILD_MODE === 'library';
  
  return {
    plugins: [react()],
    publicDir: isLibraryBuild ? false : 'public',
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process': 'undefined',
    },
    build: isLibraryBuild ? {
      lib: {
        entry: "./src/main.tsx",
        name: "SequraWidget",
        formats: ["umd"],
        fileName: (format) => `sequra-widget.${format}.js`,
      },
      rollupOptions: {
        output: {
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
          },
        },
        external: [],
      },
      minify: true,
    } : {
      // Regular build for development
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: './index.html'
        }
      }
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: [],
    },
  }
})