import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
//
export default defineConfig(({ mode }) => {
  // Clé API Google Gemini configurée directement
  const apiKey = 'AIzaSyCU5U8zjEuHOsY676bKBM0nKO5EadZEYEw';

  return {
    plugins: [react()],
    // Injection de la variable process.env.API_KEY dans l'application
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey)
    },
    build: {
      outDir: 'dist',
    },
  };
});
