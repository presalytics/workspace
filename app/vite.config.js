import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import eslintPlugin from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig( () => ({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          compatConfig: {
            MODE: 2
          }
        }
      }
    }), 
    eslintPlugin()
  ],
  define: {
    'process.env': {}
  },
  server: {
    port: 8080 
  },
  resolve: {
    alias: {
      vue: '@vue/compat'
    }
  },

}))
