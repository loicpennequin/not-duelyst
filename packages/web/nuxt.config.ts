// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: './src',
  devtools: { enabled: true },
  extends: ['@hc/game-client'],
  devServer: {
    port: 3000
  },
  sourcemap: {
    server: true,
    client: true
  }
});
