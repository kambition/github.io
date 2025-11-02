import { defineConfig } from 'vite'

export default defineConfig({
  // 如果你的仓库名是 ppt,就使用 '/ppt/'
  // 如果你使用自定义域名或 username.github.io 仓库,就使用 '/'
  base: './', // 使用相对路径,适用于所有情况
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
