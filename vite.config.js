export default {
  // 使用相对路径,适用于所有情况
  base: './',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
}
