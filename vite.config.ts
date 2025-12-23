import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Журнал',
        short_name: 'Журнал',
        description: 'Приложение для учета калорий и ведения заметок',
        theme_color: '#ffffff',
        icons: [
          {
            "src": "pwa-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "pwa-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
          },
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  base: '/journal/',
  // server: {
  //   https: {
  //     key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
  //     cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem'))
  //   },
  //   host: true
  // },
  // preview: {
  //   https: {
  //     key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
  //     cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem'))
  //   },
  //   host: true
  // }
});
