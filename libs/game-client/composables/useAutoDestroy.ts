export const useAutoDestroy = () => {
  const elementsToDestroy = ref<
    { timeout: number; displayObject: { destroy: () => void; destroyed: boolean } }[]
  >([]);

  onUnmounted(() => {
    // handles a vue3-pixi bug where the animated-sprite doesn't destroy itself on unmount
    elementsToDestroy.value?.forEach(element => {
      if (!element?.displayObject?.destroyed) {
        setTimeout(
          () => {
            element?.displayObject?.destroy();
          },
          element?.timeout ?? 0
        );
      }
    });
  });

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    autoDestroyRef: (obj: any, timeout = 0) => {
      if (!elementsToDestroy.value.some(el => el.displayObject === obj))
        elementsToDestroy.value?.push({ displayObject: obj, timeout });
    }
  };
};
