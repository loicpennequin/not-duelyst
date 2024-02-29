<script setup lang="ts">
import type { Entity, Skill } from '@hc/sdk';
import type { Nullable } from '@hc/shared';
import { useFloating } from '@floating-ui/vue';
import { offset, flip, autoUpdate } from '@floating-ui/dom';
import { uniqBy } from 'lodash-es';

const { entity } = defineProps<{
  entity: Entity;
}>();

const selectedSkill = ref<Nullable<Skill>>(null);

const reference = ref(null);
const floating = ref(null);
const { floatingStyles } = useFloating(reference, floating, {
  strategy: 'fixed',
  middleware: [offset({ mainAxis: 15 }), flip()],
  whileElementsMounted: autoUpdate,
  placement: 'right-start'
});
const isHovered = ref(false);

const keywords = computed(() => {
  return uniqBy(
    [
      ...(entity.unit.effects?.map(effect => effect.keywords) ?? []),
      ...entity.unit.skills.map(skill => skill.keywords),
      ...entity.effects.map(effect => effect.getKeywords())
    ].flat(),
    'name'
  );
});
</script>

<template>
  <article
    ref="reference"
    class="unit-blueprint-card"
    :class="entity.unit.kind.toLocaleLowerCase()"
    :style="{
      '--bg': `url('/assets/ui/card-back-${entity.unit.rarity}.png')`,
      '--sprite': `url('/assets/units/${entity.unit.spriteId}-card.png')`,
      '--sprite-mask': `url('/assets/units/${entity.unit.spriteId}-mask.png')`
    }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="cost relative">
      <template v-if="entity.unit.kind !== 'GENERAL'">
        {{ entity.unit.summonCost }}
      </template>

      <div class="runes">
        <div
          v-for="(_, i) in 3"
          :key="i"
          :style="{
            '--bg': `url('/assets/ui/rune-${
              entity.unit.factions[i]?.id.toLowerCase() ?? 'empty'
            }.png')`
          }"
        ></div>
      </div>
    </div>

    <div v-if="entity.unit.kind !== 'GENERAL'" class="cooldown">
      {{ entity.unit.summonCooldown }}
    </div>

    <div class="unit-name">
      <div>{{ entity.unit.kind }}</div>
      <div>{{ entity.unit.id }}</div>
    </div>

    <div>
      <ul class="skills-list">
        <li v-for="skill in entity.unit.skills" :key="skill.id" class="skill">
          <div
            class="skill-img"
            tabindex="0"
            :data-cooldown="skill.cooldown"
            :style="{
              '--bg': `url('/assets/skills/${skill.spriteId}.png')`
            }"
            :class="selectedSkill?.id === skill.id && 'selected'"
            @focus="selectedSkill = skill"
            @mouseenter="selectedSkill = skill"
            @mouseleave="selectedSkill = null"
          />
        </li>
      </ul>

      <Transition mode="out-in">
        <div v-if="selectedSkill" class="unit-text">
          <p>
            {{ selectedSkill.getText(entity.unit) }}
          </p>
        </div>

        <div v-else-if="entity.unit.effects?.length" class="unit-text">
          <p v-for="(effect, index) in entity.unit.effects" :key="index">
            {{ effect.description }}
          </p>
        </div>
      </Transition>
    </div>

    <div class="stats">
      <div style="--bg: url('/assets/ui/unit-attack.png'); --color: var(--red-7)">
        {{ entity.attack }}
      </div>
      <div style="--bg: url('/assets/ui/unit-speed.png'); --color: var(--blue-6)">
        {{ entity.speed }}
      </div>
      <div style="--bg: url('/assets/ui/unit-defense.png'); --color: var(--green-6)">
        {{ entity.hp }}
      </div>
    </div>

    <Teleport to="body">
      <ul
        v-if="isHovered && keywords.length"
        ref="floating"
        class="keywords"
        :style="floatingStyles"
      >
        <li v-for="keyword in keywords" :key="keyword.name" class="grid">
          <div class="font-600">{{ keyword.name }}</div>
          <p class="text-0">{{ keyword.description }}</p>
        </li>
      </ul>
    </Teleport>
  </article>
  <ul class="mt-4 pointer-none">
    <li v-for="effect in entity.effects" :key="effect.id" class="w-14 mb-2 p-2 bg-black">
      <div class="capitalize">{{ effect.id }}</div>
      <p class="text-0">{{ effect.getDescription() }}</p>
    </li>
  </ul>
</template>

<style scoped lang="postcss">
.unit-blueprint-card {
  user-select: none;

  position: relative;

  display: grid;
  grid-template-rows: auto 1fr;

  width: calc(2 * 134px);
  height: calc(2 * 188px);
  padding: var(--size-3) var(--size-4) var(--size-6);

  font-size: var(--font-size-2);
  color: white;

  background: var(--bg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;

  image-rendering: pixelated;

  &::after {
    pointer-events: none;
    content: '';

    position: absolute;
    z-index: -1;
    top: 23px;
    left: 65px;

    aspect-ratio: 1;
    width: 128px;

    background: linear-gradient(135deg, var(--gray-8), var(--gray-10));
  }

  &::before {
    pointer-events: none;
    content: '';

    position: absolute;
    z-index: 1;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-92px);

    aspect-ratio: 1;
    width: 320px;

    background: var(--sprite);
    background-repeat: no-repeat;
    background-size: 320px 320px;

    mask-image: var(--sprite-mask);
    mask-size: 320px 320px;
    /* mask-image: radial-gradient(circle at center, black, black 64px, transparent 64px),
      linear-gradient(to bottom, black, black 180px, transparent 180px); */
  }
}

.cost {
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-30%, -20%);

  display: grid;
  place-content: center;

  aspect-ratio: 1;
  width: 68px;

  font-size: var(--font-size-5);
  font-weight: var(--font-weight-7);
  color: black;

  background: url('/assets/ui/unit-cost-bg-v2.png');
  background-size: cover;
}

.cooldown {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(20px, -14px);

  display: grid;
  place-content: center;

  width: 76px;
  height: 76px;

  font-size: var(--font-size-5);
  font-weight: 700;
  color: var(--primary);

  background: url('/assets/ui/unit-cooldown.png');
  background-size: cover;
}

.runes {
  position: absolute;
  bottom: 0;

  display: flex;
  gap: var(--size-1);
  justify-content: center;

  width: 100%;
  > div {
    width: 18px;
    height: 20px;
    background-image: var(--bg);
    background-size: contain;

    &:nth-of-type(2) {
      transform: translateY(5px);
    }
  }
}

.avatar-container {
  transform: translateY(-8px);

  overflow: hidden;
  align-self: center;

  padding: 0;

  border-radius: var(--radius-round);

  > img {
    display: block;

    aspect-ratio: 1;
    width: 128px;

    object-fit: cover;

    image-rendering: pixelated;
  }
}

.stats {
  position: absolute;
  bottom: 0;
  transform: translateX(-23px) translateY(20px);

  display: flex;
  justify-content: space-between;

  width: calc(100% + 44px);
  > div {
    display: grid;
    place-content: center;

    aspect-ratio: 1;
    width: 76px;

    font-size: var(--font-size-5);
    font-weight: 700;
    color: var(--color);

    background: var(--bg);
    background-size: cover;
  }
}

.skill {
  display: flex;
  row-gap: var(--size-1);
  column-gap: var(--size-3);

  font-size: var(--font-size-1);
  line-height: 1;

  .skill-img {
    aspect-ratio: 1;
    width: 48px;
    background: url('/assets/ui/skill-border.png'), var(--bg);
    background-size: contain;
    &.selected {
      filter: contrast(130%) brightness(110%);
      outline: var(--fancy-border);
      outline-offset: 4px;
    }
  }

  [data-cooldown] {
    position: relative;
    &::after {
      content: attr(data-cooldown);

      position: absolute;
      right: 0;
      bottom: 0;
      transform: translate(50%, 50%);

      display: grid;
      place-content: center;

      aspect-ratio: 1;
      width: 3ch;

      font-size: var(--font-size-00);

      background: var(--fancy-bg);
      background-blend-mode: overlay;
      border: var(--fancy-border);
      border-radius: var(--radius-round);
    }
  }
}

.skills-list {
  display: flex;
  gap: var(--size-4);
  justify-content: center;

  > li {
    display: flex;
    gap: var(--size-2);
    align-items: center;

    margin-top: var(--size-2);
    margin-bottom: var(--size-2);

    font-size: var(--font-size-0);
    line-height: 1;
  }
}

.selected-skill {
  height: var(--size-11);
  p {
    margin: 0;
    margin: var(--size-1) 0;

    font-size: var(--font-size-00);
    white-space: break-spaces;

    opacity: 0.8;
  }
}

.unit-name {
  margin-top: 140px;
  margin-inline: var(--size-3);
  line-height: 1.1;
  > div:first-child {
    font-size: var(--font-size-00);
    color: var(--text-2);
    text-align: center;
    text-shadow: 0 2px black;
    text-transform: capitalize;
  }

  > div:last-child {
    font-size: var(--font-size-3);
    font-weight: 600;
    text-align: center;
    text-shadow: 0 2px black;
    text-transform: capitalize;
  }
}

.unit-text {
  align-self: stretch;

  margin-inline: auto;
  padding: var(--size-1) var(--size-2);

  font-size: var(--font-size-1);
  line-height: 1.1;
  text-align: center;
  text-shadow: 0 2px black;

  /* background-color: hsl(var(--gray-11-hsl) / 0.8); */
  backdrop-filter: blur(3px);

  > * {
    font-size: inherit;
  }
}

.keywords {
  z-index: 10;

  display: grid;
  gap: var(--size-4);

  width: var(--size-14);
  padding: var(--size-3);

  background-color: black;

  &:is(.v-enter-active, .v-leave-active) {
    transition: opacity 0.15s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
}
</style>
