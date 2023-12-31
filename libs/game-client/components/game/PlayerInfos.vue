<script setup lang="ts">
import { unitImagesPaths } from '../../assets/units';
import { exhaustiveSwitch } from '@hc/shared/';
import neutralBorderRounded from '../../assets/ui/icon-border-neutral-rounded.png';
import havenBorderRounded from '../../assets/ui/icon-border-haven-rounded.png';
import chaosBorderRounded from '../../assets/ui/icon-border-chaos-rounded.png';
import type { Entity } from '@hc/sdk';

const { state } = useGame();

const players = computed(() => state.value.players);

const getBorder = (entity: Entity) => {
  switch (entity.unit.faction.id) {
    case 'neutral':
      return neutralBorderRounded;
    case 'haven':
      return havenBorderRounded;
    case 'chaos':
      return chaosBorderRounded;
    default:
      throw exhaustiveSwitch;
  }
};
</script>

<template>
  <div class="player player-1">
    <div
      class="img-wrapper"
      :style="{ '--bg': `url(${getBorder(players[0].general)}` }"
      :class="state.activePlayer.equals(players[0]) && 'active'"
    >
      <img :src="`${unitImagesPaths[players[0].general.unit.spriteId + '-icon']}`" />
    </div>
    <div>
      <div class="player-name">{{ players[0].name }}</div>

      <div class="indicators">
        <div class="i-game-icons:health-normal color-green-4 hp" />
        {{ players[0].general?.hp.toFixed() }}
        <div class="i-game-icons:two-coins gold" />
        {{ players[0].gold }}
      </div>
    </div>
  </div>

  <div class="player player-2">
    <div
      class="img-wrapper"
      :style="{ '--bg': `url(${getBorder(players[1].general)}` }"
      :class="state.activePlayer.equals(players[1]) && 'active'"
    >
      <img :src="`${unitImagesPaths[players[1].general.unit.spriteId + '-icon']}`" />
    </div>
    <div>
      <div class="player-name">{{ players[1].name }}</div>

      <div class="indicators">
        <div class="i-game-icons:health-normal hp" />
        {{ players[1].general?.hp.toFixed() }}
        <div class="i-game-icons:two-coins gold" />
        {{ players[1].gold }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.player {
  display: flex;
  gap: var(--size-3);
  padding: var(--size-3);
  text-shadow: black 1px 0 5px;

  [class^='i-'] {
    font-size: var(--font-size-4);

    &.hp {
      color: var(--green-4);
    }
    &.gold {
      color: var(--yellow-5);
    }
  }
}

.img-wrapper {
  overflow: hidden;

  padding: 4px;

  background-image: var(--bg);
  background-size: cover;
  border-radius: var(--radius-round);
  box-shadow: inset 0 0 0 1px black;

  @screen lt-lg {
    align-self: flex-start;
  }

  > img {
    aspect-ratio: 1;
    width: var(--size-11);
    margin-inline: auto;
    padding: var(--size-1);

    object-fit: cover;
    border-radius: var(--radius-round);

    image-rendering: pixelated;

    @screen lt-lg {
      width: var(--size-7);
    }
  }

  &.active {
    border: solid var(--border-size-3) var(--primary);

    @screen lt-lg {
      border: solid var(--border-size-1) var(--primary);
    }
  }
}
.player-1 {
  position: absolute;
  top: var(--size-3);
  left: var(--size-5);

  @screen lt-sm {
    top: 0;
    left: 0;
  }
}
.player-2 {
  position: absolute;
  top: var(--size-3);
  right: var(--size-5);

  flex-direction: row-reverse;

  text-align: right;

  @screen lt-sm {
    top: 0;
    right: 0;
  }

  img {
    transform: rotateY(0.5turn);
  }
  .indicators {
    flex-direction: row-reverse;
  }
}

.player-name {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-6);

  @screen lt-lg {
    font-size: var(--font-size-2);
  }
}

.indicators {
  display: flex;
  gap: var(--size-2);
  align-items: center;
  font-size: var(--font-size-2);

  @screen lt-lg {
    gap: var(--size-1);
    font-size: var(--font-size-0);
  }
}
</style>
