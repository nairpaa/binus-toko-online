import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Listen di semua network interface, jadi bisa dibuka lewat IP VM dari laptop host.
    host: true,
    // Request ke /api diteruskan Vite ke backend di dalam VM. Browser cukup kenal
    // port 5173, tidak perlu tahu alamat backend dan tidak kena masalah CORS.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        // Teruskan IP asli pengunjung lewat header X-Forwarded-For (dipakai rate limit di backend).
        xfwd: true,
      },
    },
  },
});
