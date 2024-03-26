import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'
// https://vitejs.dev/config/
export default defineConfig({
  define: {
    //https://github.com/vitejs/vite/issues/1973
    'process.env': process.env // cho phép thằng vite sử dụng process.env để phần biệt mt dev vs production
  },
  plugins: [
    react(),
    svgr() //có thể sử dụng ảnh svgr
  ],

  resolve:{
    alias: [
      { find: '~', replacement: '/src' }
    ]
  }
})
