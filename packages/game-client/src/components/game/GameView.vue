<script setup lang="ts">
import { Application, BaseTexture, SCALE_MODES, WRAP_MODES } from 'pixi.js';
import { appInjectKey, createApp } from 'vue3-pixi';
import * as PIXI from 'pixi.js';
import { PixiPlugin } from 'gsap/PixiPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import PixiRenderer from './PixiRenderer.vue';
import { Stage } from '@pixi/layers';
import type { GameSession } from '@hc/sdk';
import type { GameEmits } from '../../composables/useGame';
import cursorUrl from '../../assets/cursors/cursor.png';
import cursorDisabledUrl from '../../assets/cursors/cursor_disabled.png';
import cursorAttackUrl from '../../assets/cursors/cursor_attack.png';
import cursorMoveUrl from '../../assets/cursors/cursor_move.png';
import cursorSummonUrl from '../../assets/cursors/cursor_summon.png';
import surfaceBg from '../../assets/ui{m}/surface-bg.png';

const { gameSession, playerId, isReplay } = defineProps<{
  gameSession: GameSession;
  playerId: string | null;
  isReplay?: boolean;
}>();
const emit = defineEmits<GameEmits>();

const game = useGameProvider(gameSession, emit, playerId, !!isReplay);
const { ui, assets } = game;

// @ts-ignore  enable PIXI devtools
window.PIXI = PIXI;
gsap.registerPlugin(MotionPathPlugin);
gsap.registerPlugin(PixiPlugin);
gsap.install(window);

const cursors = {
  default: `url('${cursorUrl}'), auto`,
  disabled: `url('${cursorDisabledUrl}'), auto`,
  attack: `url('${cursorAttackUrl}'), auto`,
  move: `url('${cursorMoveUrl}'), auto`,
  summon: `url('${cursorSummonUrl}'), auto`
};

const canvas = ref<HTMLCanvasElement>();

onMounted(async () => {
  // We create the pixi app manually instead of using vue3-pixi's <Application /> component
  // because we want to be able to provide a bunch of stuff so we need access to the underlying vue-pixi app
  // and we can forward the providers to it
  const pixiApp = new Application({
    view: canvas.value,
    width: window.innerWidth,
    height: window.innerHeight,
    autoDensity: true,
    antialias: false
  });

  pixiApp.resizeTo = window;
  pixiApp.renderer.events.cursorStyles = cursors;

  pixiApp.stage = new Stage();
  pixiApp.stage.sortableChildren = true;

  if (import.meta.env.DEV) {
    // @ts-ignore  enable PIXI devtools
    window.__PIXI_APP__ = pixiApp;
  }

  BaseTexture.defaultOptions.wrapMode = WRAP_MODES.CLAMP;
  BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

  const app = createApp(PixiRenderer);
  app.provide(appInjectKey, pixiApp);
  app.provide(GAME_INJECTION_KEY, game);

  const { appContext } = getCurrentInstance()!;

  const parent = appContext?.app;
  app.config.globalProperties = parent.config.globalProperties;
  Object.assign(app._context.provides, parent._context.provides);

  await assets.load();
  app.mount(pixiApp.stage);
});

const surfaceBgVar = useCssVar('--surface-bg');
surfaceBgVar.value = `url(${surfaceBg})`;
</script>

<template>
  <div class="pixi-app-container">
    <canvas
      ref="canvas"
      @contextmenu.prevent="
        e => {
          ui.targetMode.value = null;
          ui.selectedSkill.value = null;
          ui.selectedSummon.value = null;
          ui.summonTargets.value.clear();
          ui.skillTargets.value.clear();
        }
      "
    />
    <GameUi />
  </div>
</template>

<style scoped lang="postcss">
.pixi-app-container {
  cursor: v-bind('cursors.default');
  user-select: none;

  position: relative;
  transform-style: preserve-3d;

  overflow: hidden;

  font-family: monospace;
  color: var(--gray-0);

  perspective: 1200px;

  image-rendering: pixelated;
}

.pixi-app-container :is(button, input) {
  cursor: inherit !important;

  &:disabled {
    cursor: v-bind('cursors.disabled') !important;
  }
}

header {
  position: absolute;
  top: 0;
  left: 0;

  display: flex;
  gap: var(--size-3);
  align-items: center;

  width: 100%;
  padding-block: var(--size-3);
}

button {
  padding: var(--size-2) var(--size-3);
  color: white;
  background-color: var(--blue-7);
  border-radius: var(--radius-1);

  &:hover {
    background-color: var(--blue-8);
  }
  &:disabled {
    opacity: 0.5;
  }
}
</style>
