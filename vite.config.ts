import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement (depuis .env ou Vercel)
  // le 3ème argument '' permet de charger toutes les variables, pas seulement celles préfixées par VITE_
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // Remplace process.env.API_KEY par sa valeur réelle lors de la compilation
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      outDir: 'dist',
    },
  };
});