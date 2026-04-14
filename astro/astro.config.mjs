// @ts-check
import { defineConfig, envField, passthroughImageService } from 'astro/config';

import alpinejs from '@astrojs/alpinejs';

import node from '@astrojs/node';
import netlify from '@astrojs/netlify';

import tailwindcss from '@tailwindcss/vite';

const isNetlify = !!process.env.NETLIFY;

// Print all env vars
console.log(process.env);

// https://astro.build/config
export default defineConfig({
  output: 'server',

  security: {
    allowedDomains: [
      ...(process.env.NODE_ENV === 'acceptance'
        ? [{ hostname: "localhost" }]
        : []
      ),
    ],
  },

  image: {
    service: passthroughImageService(),
  },

  integrations: [alpinejs()],

  adapter: isNetlify ? netlify() : node({ mode: 'standalone' }),

  env: {
    schema: {
      DATABASE_URL: envField.string({ context: 'server', access: 'secret', default: '' }),
      BETTER_AUTH_SECRET: envField.string({ context: 'server', access: 'secret' }),
      BETTER_AUTH_URL: envField.string({ context: 'server', access: 'secret' }),
    },
  },

  vite: {
    plugins: [tailwindcss()]
  }
});