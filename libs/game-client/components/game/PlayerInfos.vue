<script setup lang="ts">
import type { Entity } from '@hc/sdk';

const { state } = useGame();

const players = computed(() => state.value.players);
</script>

<template>
  <div class="player player-1">
    <div class="img-wrapper" :class="state.activePlayer.equals(players[0]) && 'active'">
      <img :src="`/assets/units/${players[0].general.unit.spriteId}-icon.png`" />
      <div class="runes">
        <div
          v-for="(_, i) in 3"
          :key="i"
          :style="{
            '--bg': `url('/assets/ui/rune-${players[0].general.unit.factions[
              i
            ]?.id.toLowerCase()}.png')`
          }"
        />
      </div>
    </div>
    <div>
      <div class="player-name">{{ players[0].name }}</div>

      <div class="indicators">
        <div class="hp">
          {{ players[0].general?.hp.toFixed() }}
        </div>
        <div class="gold">
          {{ players[0].gold }}
        </div>
      </div>
    </div>
  </div>

  <div class="player player-2">
    <div class="img-wrapper" :class="state.activePlayer.equals(players[1]) && 'active'">
      <img :src="`/assets/units/${players[1].general.unit.spriteId}-icon.png`" />
      <div class="runes">
        <div
          v-for="(_, i) in 3"
          :key="i"
          :style="{
            '--bg': `url('/assets/ui/rune-${players[1].general.unit.factions[
              i
            ]?.id.toLowerCase()}.png')`
          }"
        />
      </div>
    </div>
    <div>
      <div class="player-name">{{ players[1].name }}</div>

      <div class="indicators">
        <div class="hp">
          {{ players[0].general?.hp.toFixed() }}
        </div>
        <div class="gold">
          {{ players[0].gold }}
        </div>
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
  position: relative;

  display: grid;
  place-content: center;

  aspect-ratio: 1;
  width: 140px;
  padding: 4px;

  background-image: url('/assets/ui/hero-portrait-border.png');
  /* border: var(--fancy-border); */
  box-shadow: inset 0 0 0 1px black;

  @screen lt-lg {
    align-self: flex-start;
  }

  > img {
    aspect-ratio: 1;
    width: 132px;
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
    /* border: solid var(--border-size-3) var(--primary); */

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
}

.player-name {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-6);

  @screen lt-lg {
    font-size: var(--font-size-2);
  }
}

.indicators {
  display: grid;
  gap: var(--size-2);
  font-size: var(--font-size-2);

  @screen lt-lg {
    gap: var(--size-1);
    font-size: var(--font-size-0);
  }

  .player-2 & {
    justify-items: end;
  }
}
.hp {
  background-image: url('/assets/ui/hero-portrait-hp.png');
}

.gold {
  background-image: url('/assets/ui/hero-portrait-gold.png');
}

:is(.gold, .hp) {
  display: grid;
  place-content: center;

  aspect-ratio: 1;
  width: 48px;

  background-size: cover;
}
.runes {
  position: absolute;
  z-index: 1;
  bottom: calc(-1 * var(--size-2));
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  gap: 6px;
  justify-content: center;

  width: fit-content;
  padding: 6px 3px;

  background-image: url('/assets/ui/runes-bg.png');
  background-size: contain;
  > div {
    transform: translateY(-2px);

    width: 20px;
    height: 24px;

    background-image: var(--bg);
    background-size: contain;

    &:nth-of-type(2) {
      transform: translateY(2px);
    }
  }
}
</style>
