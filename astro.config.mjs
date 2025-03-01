import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import solid from '@astrojs/solid-js';
import dotenv from 'dotenv';
import vercel from '@astrojs/vercel';

// Cargar variables de entorno desde .env
dotenv.config();

export default defineConfig({
  integrations: [tailwind(), solid()],
  adapter: vercel(),
  output: 'server',
});

