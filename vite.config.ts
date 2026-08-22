import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import hdbHandler from './api/hdb';
import onemapSearchHandler from './api/onemap/search';
import healthHandler from './api/health';

function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const [pathname, search] = req.url.split('?');
        const query: Record<string, string> = {};
        if (search) {
          new URLSearchParams(search).forEach((v, k) => {
            query[k] = v;
          });
        }

        const expressLikeReq = Object.assign(req, {
          query,
        });

        const expressLikeRes = Object.assign(res, {
          status(code: number) {
            res.statusCode = code;
            return this;
          },
          json(data: any) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return this;
          },
        });

        try {
          if (pathname === '/api/hdb') {
            return await hdbHandler(expressLikeReq, expressLikeRes);
          } else if (pathname === '/api/onemap/search') {
            return await onemapSearchHandler(expressLikeReq, expressLikeRes);
          } else if (pathname === '/api/health') {
            return healthHandler(expressLikeReq, expressLikeRes);
          }
        } catch (err) {
          console.error('API middleware error:', err);
          return expressLikeRes.status(500).json({ error: String(err) });
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'leaflet-vendor': ['leaflet'],
            'charts-vendor': ['recharts'],
            'icons-vendor': ['lucide-react', 'motion'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
