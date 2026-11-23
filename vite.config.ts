import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

function apkServePlugin(): Plugin {
  const serveApk = (req: {url?: string}, res: any, next: () => void) => {
    const urlPath = (req.url || '').split('?')[0];
    const rootDir = import.meta.dirname || __dirname;

    if (urlPath === '/MyMoney.apk' || urlPath === '/downloads/MyMoney.apk') {
      const apkPath = path.resolve(rootDir, 'public', 'MyMoney.apk');
      if (fs.existsSync(apkPath)) {
        const stat = fs.statSync(apkPath);
        res.writeHead(200, {
          'Content-Type': 'application/vnd.android.package-archive',
          'Content-Disposition': 'attachment; filename="MyMoney.apk"',
          'Content-Length': stat.size,
          'Cache-Control': 'no-store',
        });
        fs.createReadStream(apkPath).pipe(res);
        return;
      }
    }

    if (urlPath === '/MyMoney.aab' || urlPath === '/downloads/MyMoney.aab') {
      const aabPath = path.resolve(rootDir, 'public', 'MyMoney.aab');
      if (fs.existsSync(aabPath)) {
        const stat = fs.statSync(aabPath);
        res.writeHead(200, {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': 'attachment; filename="MyMoney.aab"',
          'Content-Length': stat.size,
          'Cache-Control': 'no-store',
        });
        fs.createReadStream(aabPath).pipe(res);
        return;
      }
    }

    next();
  };

  return {
    name: 'serve-apk-mime',
    configureServer(server) {
      server.middlewares.use(serveApk);
    },
    configurePreviewServer(server) {
      server.middlewares.use(serveApk);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      apkServePlugin(),
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'MyMoney - Personal Finance',
          short_name: 'MyMoney',
          description: 'Complete fintech personal finance application with net worth tracking, multi-account ledger, budgets, savings goals, recurring bills, and financial analytics.',
          theme_color: '#047857',
          background_color: '#020617',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          orientation: 'portrait-primary',
          categories: ['finance', 'productivity', 'utilities'],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          navigateFallbackDenylist: [/\.apk$/i, /\.aab$/i, /^\/downloads\//i, /^\/privacy\.html$/i],
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || __dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
