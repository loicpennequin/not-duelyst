<script setup lang="ts">
const { state } = useGame();

const players = computed(() => state.value.players);
</script>

<template>
  <div class="player player-1" :class="state.activePlayer.equals(players[0]) && 'active'">
    <div class="img-wrapper">
      <img :src="`/assets/units/${players[0].general.unit.spriteId}-icon.png`" />
      <div class="runes">
        <div
          v-for="(_, i) in 3"
          :key="i"
          :style="{
            '--bg': `url('/assets/ui/rune-${
              players[0].general.unit.factions[i]?.id.toLowerCase() ?? 'empty'
            }.png')`
          }"
        />
      </div>
    </div>
    <div>
      <div class="player-name">{{ players[0].name }}</div>

      <div class="indicators">
        <div class="hp">
          <Transition mode="out-in">
            <span :key="players[0].general?.hp.toFixed()">
              {{ players[0].general?.hp.toFixed() }}
            </span>
          </Transition>
        </div>
        <div class="gold">
          <Transition mode="out-in">
            <span :key="players[0].gold">
              {{ players[0].gold }}
            </span>
          </Transition>
        </div>
      </div>
    </div>
  </div>

  <div class="player player-2" :class="state.activePlayer.equals(players[1]) && 'active'">
    <div class="img-wrapper">
      <img :src="`/assets/units/${players[1].general.unit.spriteId}-icon.png`" />
      <div class="runes">
        <div
          v-for="(_, i) in 3"
          :key="i"
          :style="{
            '--bg': `url('/assets/ui/rune-${
              players[1].general.unit.factions[i]?.id.toLowerCase() ?? 'empty'
            }.png')`
          }"
        />
      </div>
    </div>
    <div>
      <div class="player-name">{{ players[1].name }}</div>

      <div class="indicators">
        <div class="hp">
          <Transition mode="out-in">
            <span :key="players[1].general?.hp.toFixed()">
              {{ players[1].general?.hp.toFixed() }}
            </span>
          </Transition>
        </div>
        <div class="gold">
          <Transition mode="out-in">
            <span :key="players[1].gold">
              {{ players[1].gold }}
            </span>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.player {
  isolation: isolate;
  position: relative;

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
    position: relative;
    z-index: -1;

    aspect-ratio: 1;
    width: 132px;
    margin-inline: auto;
    padding: var(--size-1);

    object-fit: cover;
    border-radius: var(--radius-round);

    image-rendering: pixelated;
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

  .player.active & {
    color: var(--primary);
    text-decoration: underline;
  }

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
  :is(.v-enter-active, .v-leave-active) {
    transition:
      opacity 0.4s,
      transform 0.4s,
      color 0.2s;
  }
  :is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
  :is(.v-leave-to) {
    transform: scale(2) translateY(var(--size-2));
    color: red;
  }
  :is(.v-enter-from) {
    transform: translateY(calc(-1 * var(--size-2)));
  }
}

.gold {
  background-image: url('/assets/ui/hero-portrait-gold.png');
  :is(.v-enter-active, .v-leave-active) {
    transition:
      opacity 0.4s,
      transform 0.4s;
  }
  :is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
  :is(.v-leave-to) {
    transform: scale(2) translateY(var(--size-2));
  }
  :is(.v-enter-from) {
    transform: translateY(calc(-1 * var(--size-2)));
  }
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
