import { defineConfig } from 'vite'
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
      fileName: "sequra-widget",
      formats: ["umd"],
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
})