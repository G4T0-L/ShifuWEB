import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import solid from '@astrojs/solid-js';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env
dotenv.config();

export default defineConfig({
  integrations: [tailwind(), solid()],
  adapter: node({
    mode: 'standalone',
  }),
  output: 'server'
});
