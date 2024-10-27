/* eslint-disable no-undef */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env, // Expose the env variables to the client
  },
  build: {
    outDir: 'dist', // This must match Netlify's publish directory
  },
  server: {
    open: true, // Optional: Automatically opens the browser
  },
});
