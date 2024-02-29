export const useDarkMode = () => {
  const colorMode = useColorMode();

  const cookie = useCookie('color-mode');

  watchEffect(() => {
    if (colorMode.preference === 'system') return;
    cookie.value = colorMode.preference;
  });

  return computed({
    get() {
      if (colorMode.value === 'system') return cookie.value === 'dark';
      return colorMode.value === 'dark';
    },
    set(val) {
      colorMode.preference = val ? 'dark' : 'light';
    }
  });
};
