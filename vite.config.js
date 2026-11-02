import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      // The portfolio is the root entry. West African Produce is a subpage with its own storefront and staff queue.
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        wap: fileURLToPath(new URL('./west-african-produce/index.html', import.meta.url)),
        wapAdmin: fileURLToPath(new URL('./west-african-produce/admin/index.html', import.meta.url)),
      },
    },
  },
})
