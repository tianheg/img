import { defineConfig } from 'astro/config';

import auth from 'auth-astro';
import cloudflare from '@astrojs/cloudflare';
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [auth(), tailwind()],
  output: 'server',
  adapter: cloudflare(),
  vite: {
    ssr: {
      noExternal: true
    },
  },
});