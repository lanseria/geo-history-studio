// app/plugins/cesium.client.ts
export default defineNuxtPlugin(() => {
  // 设置 Cesium 静态资源基础路径
  // Nuxt 会将 public 目录下的文件服务在根路径
  // 因此，我们之前复制的路径是 'public/cesium'，访问 URL 就是 '/cesium/'
  window.CESIUM_BASE_URL = '/cesium/'

  // 这里的 Cesium 对象可以按需注入到 NuxtApp 中，
  // 但更常见的做法是在需要用的组件里直接 import。
  // 我们暂时只设置 window 变量。
})
