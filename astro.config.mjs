import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import solid from '@astrojs/solid-js';
import dotenv from 'dotenv';
import vercelServerless from '@astrojs/vercel/serverless';

// Cargar variables de entorno desde .env
dotenv.config();

export default defineConfig({
  integrations: [tailwind(), solid()],
  output: 'server',
  adapter: vercelServerless({}),
});

