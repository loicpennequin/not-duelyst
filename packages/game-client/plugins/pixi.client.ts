// import { Layer } from '@pixi/layers';
import { Viewport, type IViewportOptions } from 'pixi-viewport';
import { patchProp, renderer } from 'vue3-pixi';
import { Layer } from '@pixi/layers';

export default defineNuxtPlugin(async () => {
  renderer.use({
    name: 'Viewport',
    createElement: props => new Viewport(props as IViewportOptions),
    patchProp(el, key, prevValue, nextValue) {
      return patchProp(el, key, prevValue, nextValue);
    }
  });

  renderer.use({
    name: 'Layer',
    createElement: () => new Layer(),
    patchProp(el, key, prevValue, nextValue) {
      return patchProp(el, key, prevValue, nextValue);
    }
  });
});
