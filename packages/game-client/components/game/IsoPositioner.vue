<script setup lang="ts">
import type { Point3D } from '@hc/sdk';
import { rotate } from '../../utils/rotate-map';

const {
  x,
  y,
  z,
  offset = { x: 0, y: 0, z: 0 },
  zIndexOffset = 0,
  map,
  animated
} = defineProps<{
  x: number;
  y: number;
  z: number;
  offset?: Point3D;
  zIndexOffset?: number;
  map: { width: number; height: number; rotation: 0 | 90 | 180 | 270 };
  animated: boolean;
}>();

const position = computed(() =>
  toIso({ x, y, z }, map.rotation, {
    width: map.width / 2,
    height: map.height / 2
  })
);

const { autoDestroyRef } = useAutoDestroy();

const containerX = computed(() => position.value.isoX + offset.x);
const containerY = computed(() => position.value.isoY - position.value.isoZ + offset.y);

const rotatedCartesian = computed(() => {
  const track = { x, y, z };

  const hackX = map.rotation === 270 || map.rotation === 180 ? Math.floor : Math.ceil;
  const hackY = map.rotation === 90 || map.rotation === 180 ? Math.floor : Math.ceil;

  const floor: any[][] = [];
  for (let floorY = 0; floorY <= map.height; floorY++) {
    const row: any[] = [];
    floor.push(row);
    for (let floorX = 0; floorX <= map.width; floorX++) {
      row.push(hackX(track.x) === floorX && hackY(track.y) === floorY ? track : null);
    }
  }

  const rotatedFloor = rotate(floor, map.rotation).flatMap((row, y) =>
    row.map((track, x) => ({
      track,
      floorX: x,
      floorY: y
    }))
  );
  const rotatedCell = rotatedFloor.find(cell => cell.track === track)!;

  return {
    x: rotatedCell.floorX,
    y: rotatedCell.floorY,
    z
  };
});

const zIndex = computed(() => {
  return (
    rotatedCartesian.value.x * 2 +
    rotatedCartesian.value.y * 2 +
    rotatedCartesian.value.z * 2 +
    zIndexOffset +
    containerY.value / 1000 // hack hack hack hack
  );
});

const tweened = ref({ x: containerX.value, y: containerY.value });

watch([containerX, containerY], ([newX, newY]) => {
  gsap.to(tweened.value, {
    duration: animated ? 0 : 0.5,
    x: newX,
    ease: animated ? Power0.easeNone : Power2.easeOut
  });
  gsap.to(tweened.value, {
    duration: animated ? 0 : 0.5,
    y: newY,
    ease: animated ? Power0.easeNone : Power2.easeOut
  });
});

const showDebug = ref(false);
</script>

<template>
  <container
    v-bind="$attrs"
    :ref="
      _container => {
        if (!_container) return;
        autoDestroyRef(_container);
      }
    "
    :x="tweened.x"
    :y="tweened.y"
    :z-order="zIndex"
    :z-index="zIndex"
  >
    <slot />
    <!-- <text
      v-if="showDebug"
      :style="{ fill: 'white', fontSize: 35, fontFamily: 'monospace' }"
      :scale="0.25"
      :anchor="0.5"
      event-mode="none"
    >
      x:{{ x }} y:{{ y }} z{{ z }}{{ '\n' }}z-index:{{ zIndex.toFixed(1) }}
    </text> -->
  </container>
</template>
