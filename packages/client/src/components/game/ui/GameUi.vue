<script setup lang="ts">
const { ui } = useGame();

const entity = computed(() => ui.hoveredEntity.value);
</script>

<template>
  <TeamInfos />
  <ActionBar />
  <TargetingUi />
  <CombatLog />

  <div
    v-if="entity"
    class="absolute top-13"
    :class="entity.player.isPlayer1 ? 'left-10' : 'right-10'"
  >
    <Card
      :card="{
        name: entity.card.blueprint.name,
        description: entity.card.blueprint.description,
        kind: entity.card.kind,
        spriteId: entity.card.blueprint.spriteId,
        rarity: entity.card.blueprint.rarity,
        attack: entity.attack,
        hp: entity.hp,
        cost: entity.card.cost
      }"
    />
  </div>
</template>