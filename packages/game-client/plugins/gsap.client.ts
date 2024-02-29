import gsap from 'gsap';

export default defineNuxtPlugin(async nuxtApp => {
  gsap.install(window);
});
