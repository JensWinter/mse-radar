// @ts-check
import { defineConfig, envField, passthroughImageService } from 'astro/config';

import alpinejs from '@astrojs/alpinejs';

import node from '@astrojs/node';

import tailwindcss from '@tailwindcss/vite';

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

  adapter: node({
    mode: 'standalone',
  }),

  env: {
    schema: {
      DATABASE_URL: envField.string({ context: 'server', access: 'secret', default: '' }),
      BETTER_AUTH_SECRET: envField.string({ context: 'server', access: 'secret' }),
      BETTER_AUTH_URL: envField.string({ context: 'server', access: 'public' }),
    },
  },

  vite: {
    plugins: [tailwindcss()]
  }
});