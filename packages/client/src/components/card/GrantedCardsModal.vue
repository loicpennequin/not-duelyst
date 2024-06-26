<script setup lang="ts">
import { api } from '@game/api';
import { CARDS } from '@game/sdk';

const { collection } = useCollection();

const grantedCards = computed(() => {
  if (!collection.value) return [];

  return collection.value
    ?.filter(card => card.grantedAt)
    .map(({ cardId }) => CARDS[cardId]);
});

const { mutate: acknowledge, isLoading: isAcknowledging } = useConvexAuthedMutation(
  api.collection.acknowledgeGranted
);

const assets = useAssets();
</script>

<template>
  <UiModal
    :is-opened="grantedCards.length > 0"
    title="Looks like you were gifted some new cards!"
    :closable="false"
    :style="{ '--ui-modal-size': 'var(--size-lg)' }"
  >
    <ul v-if="assets.loaded.value" class="fancy-scrollbar">
      <li v-for="card in grantedCards" :key="card.id">
        <Card
          has-modal
          :card="{
            blueprintId: card.id,
            name: card.name,
            description: card.description,
            kind: card.kind,
            spriteId: card.spriteId,
            rarity: card.rarity,
            attack: card.attack,
            hp: card.maxHp,
            speed: card.speed,
            cost: card.cost,
            skills: card.skills,
            factions: card.factions,
            tribes: card.tribes ?? []
          }"
        />
      </li>
    </ul>

    <footer>
      <UiFancyButton @click="acknowledge({})">Got it !</UiFancyButton>
    </footer>
  </UiModal>
</template>

<style scoped lang="postcss">
ul {
  scroll-snap-type: y mandatory;

  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  row-gap: var(--size-10);
  column-gap: var(--size-5);

  max-height: 70dvh;

  > li {
    scroll-margin-block-start: var(--size-4);
    scroll-snap-align: start;
  }
}

footer {
  width: fit-content;
  margin-block-start: var(--size-3);
  margin-inline: auto;
}
</style>
