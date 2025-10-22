import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process': 'undefined',
  },
  build: {
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
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
})