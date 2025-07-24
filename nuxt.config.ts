import { appDescription } from './app/constants/index'

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/eslint',
    'dayjs-nuxt',
  ],

  ssr: false,
  devtools: {
    enabled: true,
  },
  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: appDescription },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: 'white' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#222222' },
      ],
    },
  },
  // [新增] 引入全局 CSS 文件
  css: [
    '~/assets/css/main.css',
  ],

  colorMode: {
    classSuffix: '',
  },

  runtimeConfig: {
    dbUrl: '',
    redis: {
      host: '',
      password: '',
      db: 4,
    },
    // public 部分的配置将暴露给客户端和服务器端
    public: {
      tdtKey: '',
      cesiumIonToken: '',
    },
  },
  devServer: {
    port: 3333,
  },

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: true,
  },

  compatibilityDate: '2025-06-25',
  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    experimental: {
      database: true,
      tasks: true,
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'dayjs',
        'dayjs/plugin/updateLocale',
        'dayjs/plugin/relativeTime',
        'dayjs/plugin/utc',
        'zxcvbn',
      ],
    },
  },

  eslint: {
    config: {
      standalone: false,
      nuxt: {
        sortConfigKeys: true,
      },
    },
  },

})
