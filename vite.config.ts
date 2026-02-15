import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement (depuis .env ou Vercel)
  // Utilise (process as any).cwd() pour éviter les erreurs TS
  const env = loadEnv(mode, (process as any).cwd(), '');

  // On récupère la clé depuis API_KEY ou VITE_API_KEY pour plus de flexibilité
  const apiKey = env.API_KEY || env.VITE_API_KEY || '';

  return {
    plugins: [react()],
    // Injection directe de la clé dans une constante globale
    define: {
      __APP_API_KEY__: JSON.stringify(apiKey)
    },
    build: {
      outDir: 'dist',
    },
  };
});