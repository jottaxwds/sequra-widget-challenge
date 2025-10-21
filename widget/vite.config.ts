import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    lib: {
      entry: "./src/main.tsx",
      name: "SequraWidget",
      fileName: "sequra-widget",
      formats: ["umd"],
    },
    rollupOptions: {
      output: {},
    },
  },
})
