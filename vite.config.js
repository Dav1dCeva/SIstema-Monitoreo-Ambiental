import { defineConfig } from 'vite';
import { resolve } from 'path';

const isProd = process.env.GITHUB_ACTIONS === 'true';
const base = isProd ? '/SIstema-Monitoreo-Ambiental/' : './';

export default defineConfig({
  base,
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'src/pages/login.html'),
        dashboard: resolve(__dirname, 'src/pages/dashboard.html'),
        umbrales: resolve(__dirname, 'src/pages/umbrales.html'),
        consulta: resolve(__dirname, 'src/pages/consulta-datos.html'),
        alertas: resolve(__dirname, 'src/pages/alertas.html'),
        reportes: resolve(__dirname, 'src/pages/reporte-fallas.html'),
        lecturas: resolve(__dirname, 'src/pages/lecturas-manuales.html'),
        sitemap: resolve(__dirname, 'src/pages/sitemap.html'),
      }
    }
  }
});
