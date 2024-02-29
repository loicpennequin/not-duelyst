import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    'radix-vue/nuxt',
    '@vueuse/nuxt',
    '@unocss/nuxt',
    'dayjs-nuxt',
    'nuxt-icon',
    '@nuxtjs/color-mode',
    '@formkit/auto-animate/nuxt'
  ],
  vite: {
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }
  },
  css: [
    'open-props/postcss/style',
    'open-props/colors-hsl',
    join(currentDir, './styles/global.css')
  ],
  postcss: {
    plugins: {
      autoprefixer: true,
      '@unocss/postcss': {
        configOrPath: join(currentDir, './uno.config.ts')
      },
      'postcss-viewport-unit-fallback': {},
      'postcss-nesting': { noIsPseudoSelector: false },
      'postcss-custom-media': {
        preserve: false
      },
      'postcss-scrollbar': {}
    }
  },
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classPrefix: '',
    classSuffix: ''
  },
  unocss: {
    autoImport: false
  },
  dayjs: {
    locales: ['en', 'fr'],
    plugins: ['relativeTime', 'utc', 'timezone', 'duration'],
    defaultLocale: 'en'
  }
});
