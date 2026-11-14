import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    server: {
        proxy: {
            '/api': {
                target: process.env.API_TARGET || 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('proxy err:', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log(
                            'Received Response from the Target:',
                            proxyRes.statusCode,
                            req.url
                        );
                    });
                },
            },
        },
    },
    plugins: [
        tailwindcss(),
        sveltekit({
            adapter: adapter({
                // default options are shown. On some platforms
                // these options are set automatically — see below
                pages: 'build',
                assets: 'build',
                fallback: undefined,
                precompress: false,
                strict: true,
            }),
            alias: {
                $lib: 'src/lib',
            },
            output: {
                // Force everything into one HTML file. SvelteKit will still generate
                // a lot of JS files but they are deadweight and will not be included
                // in the rust binary.
                bundleStrategy: 'inline',
            },
            version: {
                // Use a deterministic version string for reproducible builds.
                // Without this option, SvelteKit will use a timestamp.
                name: process.env.GITHUB_SHA || 'dev',
            },
        }),
    ],
    build: {
        // Force everything into one HTML file. SvelteKit will still generate
        // a lot of JS files but they are deadweight and will not be included
        // in the rust binary.
        assetsInlineLimit: Infinity,
    },
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
    },
});
