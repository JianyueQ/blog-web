import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression' // 添加压缩插件

const baseUrl = 'http://localhost:8998' // 后端接口

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 生产环境启用 gzip 和 brotli 压缩
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 只有大于该值的资源才会被压缩，默认为 10240 字节
      algorithm: 'gzip', // 压缩算法，可选 'gzip' 或 'brotliCompress'
      ext: '.gz' // 文件后缀
    }),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress', // 使用 Brotli 算法获得更高压缩率
      ext: '.br'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/style/global.scss";`
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: baseUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    // 构建输出目录
    outDir: 'blog',
    // 资源文件存放目录
    assetsDir: 'assets',
    // 启用 rollup 的 sourcemap
    sourcemap: false, // 生产环境设置为 false
    // 设置为 false 可以禁用最小化混淆
    minify: 'terser', // 使用 terser 更高级的压缩
    // 构建后是否生成 source map 文件
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // 分包策略
        manualChunks: {
          // 将 Vue 相关库打包成单独文件
          vendor: ['vue', 'vue-router', 'pinia'],
          // Element Plus 单独打包
          elementPlus: ['element-plus'],
          // axios 单独打包
          axios: ['axios'],
          // Lodash 单独打包
          lodash: ['lodash-es'],
          // markdown 相关库打包
          markdown: ['markdown-it', 'highlight.js']
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // 设置构建大小警告阈值
    chunkSizeWarningLimit: 2000 // 单位 KB
  }
})
