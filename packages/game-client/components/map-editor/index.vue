<script setup lang="ts">
import { Application } from 'vue3-pixi';
import * as PIXI from 'pixi.js';
import { INTERACTABLES, TILES, Cell, Tile, type Point3D } from '@hc/sdk';
import { isString, isDefined } from '@hc/shared';
import { PixiPlugin } from 'gsap/PixiPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { tileImagesPaths } from '../../assets/tiles{m}';
import { interactableImagesPaths } from '../../assets/interactables{m}';
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
  SwitchRoot,
  SwitchThumb
} from 'radix-vue';
import { api } from '@hc/api';
import type { GameMapDto } from '@hc/api';
import { parse, stringify } from 'zipson';
import type { SerializedInteractable } from '@hc/sdk/src/interactable/interactable';

gsap.registerPlugin(PixiPlugin);
gsap.registerPlugin(MotionPathPlugin);

gsap.install(window);

// @ts-ignore  enable PIXI devtools
window.PIXI = PIXI;
const MAX_X = 20;
const MAX_Y = 20;
const MAX_Z = 8;
const TILE_TO_EDITOR_SPRITE = {
  ground: 'editor-ground',
  groundHalf: 'editor-ground-half',
  water: 'editor-water',
  waterHalf: 'editor-water-half',
  obstacle: 'editor-obstacle'
};

export type EditorMap = {
  name: string;
  width: number;
  height: number;
  cells: Cell[];
  startPositions: [Point3D, Point3D];
  interactables: SerializedInteractable[];
};
const makeDefaultMap = (): EditorMap => ({
  name: 'New Map',
  width: 5,
  height: 5,
  interactables: [],
  cells: Array.from({ length: 5 }, (_, y) =>
    Array.from({ length: 5 }, (_, x) => ({
      position: { x, y, z: 0 },
      tileId: 'ground',
      spriteIds: []
    }))
  )
    .flat()
    .map(cell => new Cell(new Tile(cell.tileId), cell.position, cell.spriteIds)),
  startPositions: [
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 }
  ]
});

type ParsedCell = { position: Point3D; tileId: string; spriteIds: string[] };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const makeMap = ({ id, ...serializedMap }: GameMapDto) => {
  const parsedCells = parse(serializedMap.cells) as ParsedCell[];

  map.value = {
    ...serializedMap,
    cells: parsedCells.map(
      cell => new Cell(new Tile(cell.tileId), cell.position, cell.spriteIds)
    )
  };
};

const map = ref(makeDefaultMap());
const { undo, redo } = useRefHistory(map, {
  capacity: 100,
  deep: true,
  dump: (el: EditorMap) =>
    JSON.stringify({
      ...el,
      cells: el.cells.map(cell => cell.serialize())
    }),
  parse: (str: string) => {
    const serialized = JSON.parse(str);
    return {
      ...serialized,
      cells: serialized.cells.map(
        (cell: any) => new Cell(new Tile(cell.tileId), cell.position, cell.spriteIds)
      )
    };
  }
});

const canvasContainer = ref<HTMLElement>();

const assets = useAssetsProvider();
const isReady = ref(false);
assets.load().then(() => {
  isReady.value = true;
});

const rotation = ref<0 | 90 | 180 | 270>(0);

const selectedSprite = ref<string | null>(null);
const selectedTileId = ref<string | null>(null);

const isCtrlKeyPressed = ref(false);
const isShiftKeyPressed = ref(false);
const isAltKeyPressed = ref(false);
const isPlacingPlayer1 = ref(false);
const isPlacingPlayer2 = ref(false);

onMounted(() => {
  window.addEventListener('keydown', e => {
    if (e.ctrlKey && e.code === 'KeyW') {
      undo();
      return;
    }
    if (e.ctrlKey && e.code === 'KeyY') {
      return redo();
    }
    if (e.code === 'ControlLeft') {
      isCtrlKeyPressed.value = true;
    }
    if (e.code === 'ShiftLeft') {
      isShiftKeyPressed.value = true;
    }
    if (e.code === 'AltLeft') {
      isAltKeyPressed.value = true;
    }

    if (e.code === 'KeyQ')
      rotation.value = ((rotation.value + 360 - 90) % 360) as 0 | 90 | 180 | 270;

    if (e.code === 'KeyE')
      rotation.value = ((rotation.value + 360 + 90) % 360) as 0 | 90 | 180 | 270;
  });
  window.addEventListener('keyup', () => {
    isCtrlKeyPressed.value = false;
    isShiftKeyPressed.value = false;
    isAltKeyPressed.value = false;
  });
});

const placeMode = ref<'tile' | 'sprite'>('tile');
const actionMode = ref<'add' | 'remove'>('add');

const onCellPointerdown = (cell: Cell) => {
  if (isPlacingPlayer1.value || isPlacingPlayer2.value || currentTab.value !== 'tiles') {
    return;
  }
  isDragging.value = true;

  onMouseAction(cell);
};

const onCellPointerenter = (cell: Cell) => {
  if (!isDragging.value || currentTab.value !== 'tiles') return;
  onMouseAction(cell);
};

const onCellPointerup = (cell: Cell) => {
  isDragging.value = false;
  if (isPlacingPlayer1.value) {
    map.value.startPositions[0] = cell.position.serialize();
    isPlacingPlayer1.value = false;
  }
  if (isPlacingPlayer2.value) {
    map.value.startPositions[1] = cell.position.serialize();
    isPlacingPlayer2.value = false;
  }
  if (currentTab.value === 'interactables' && selectedInteractableId.value) {
    const existingIndex = map.value.interactables.findIndex(i =>
      cell.position.equals(i.position)
    );
    if (existingIndex >= 0) {
      if (isCtrlKeyPressed.value) {
        map.value.interactables.splice(existingIndex, 1);
      } else {
        map.value.interactables[existingIndex].id = selectedInteractableId.value;
      }
    } else {
      map.value.interactables.push({
        position: cell.position.serialize(),
        id: selectedInteractableId.value
      });
    }
  }
};

const isDragging = ref(false);

const onMouseAction = (cell: Cell) => {
  switch (actionMode.value) {
    case 'add':
      switch (placeMode.value) {
        case 'sprite':
          return AddSpriteToTile(cell);
        case 'tile':
          return changeTile(cell);
      }
      break;
    case 'remove':
      switch (placeMode.value) {
        case 'sprite':
          return removeSpriteFromTile(cell);
        case 'tile':
          return removeTile(cell);
      }
  }
};

const changeTile = (cell: Cell) => {
  if (isCtrlKeyPressed.value) {
    return removeTile(cell);
  }
  if (!selectedTileId.value) return;
  if (isShiftKeyPressed.value) {
    const coords = { x: cell.x, y: cell.y, z: cell.z + 1 };
    let existingCell = map.value.cells.find(c => c.position.equals(coords));
    while (existingCell) {
      coords.z++;
      existingCell = map.value.cells.find(c => c.position.equals(coords));
    }

    if (coords.z >= MAX_Z) return;
    if (existingCell) return;
    else {
      map.value.cells.push(new Cell(new Tile(selectedTileId.value), coords, []));
    }
    // toggle sprite presence on the cell
  } else {
    cell.tile = new Tile(selectedTileId.value);
  }
};

const removeTile = (cell: Cell) => {
  if (cell.z === 0) return;
  map.value.cells = map.value.cells.filter(c => !c.position.equals(cell.position));
};

const AddSpriteToTile = (cell: Cell) => {
  if (isCtrlKeyPressed.value) return removeSpriteFromTile(cell);
  if (!selectedSprite.value) return;
  else if (isAltKeyPressed.value) {
    const idx = cell.spriteIds.indexOf(selectedSprite.value);
    if (idx >= 0) {
      cell.spriteIds.splice(idx, 1);
    } else if (idx < 0) {
      cell.spriteIds.push(selectedSprite.value);
    }
    // replace the cell sprites
  } else {
    cell.spriteIds = [selectedSprite.value];
  }
};

const removeSpriteFromTile = (cell: Cell) => {
  cell.spriteIds = [];
};

const visibleFloors = ref<Record<number, boolean>>({ 0: true });
watchEffect(() => {
  const floors = new Set<number>([]);
  map.value.cells.forEach(cell => {
    floors.add(cell.position.z);
  });

  floors.forEach(floor => {
    if (!isDefined(visibleFloors.value[floor])) {
      visibleFloors.value[floor] = true;
    }
  });

  Object.keys(visibleFloors.value).forEach(floor => {
    if (!floors.has(Number(floor))) {
      delete visibleFloors.value[Number(floor)];
    }
  });
});

const { data: maps } = useConvexQuery(api.gameMaps.getAll, {});

watch(
  () => map.value.width,
  newX => {
    map.value.cells = map.value.cells.filter(cell => cell.x < newX);
    for (let x = 0; x < newX; x++) {
      for (let y = 0; y < map.value.height; y++) {
        const pos = { x, y, z: 0 };
        if (!map.value.cells.some(cell => cell.position.equals(pos))) {
          map.value.cells.push(new Cell(new Tile('ground'), pos, []));
        }
      }
    }
  }
);
watch(
  () => map.value.height,
  newY => {
    map.value.cells = map.value.cells.filter(cell => cell.y < newY);
    for (let x = 0; x < map.value.width; x++) {
      for (let y = 0; y < newY; y++) {
        const pos = { x, y, z: 0 };
        if (!map.value.cells.some(cell => cell.position.equals(pos))) {
          map.value.cells.push(new Cell(new Tile('ground'), pos, []));
        }
      }
    }
  }
);

const saveMap = useConvexMutation(api.gameMaps.save, {
  onError(err) {
    console.log(err);
  }
});

const save = async () => {
  if (map.value.cells.some(cell => !cell.spriteIds.length)) {
    alert('Some tiles have no sprite !');
    return;
  }

  await saveMap.mutate({
    ...map.value,
    cells: stringify(map.value.cells.map(cell => cell.serialize()))
  });
};

const spriteSearch = ref('');
const fitleredSprites = computed(() => {
  return Object.entries(tileImagesPaths)
    .map(([name, src]) => ({ name, src }))
    .filter(({ name }) => name.toLowerCase().includes(spriteSearch.value.toLowerCase()));
});

const getSpriteIconOffset = (name: string) => {
  const isSymmetrical = !['north', 'east', 'west', 'south'].some(dir =>
    name.includes(dir)
  );
  const spriteSize = 96;
  if (isSymmetrical) return 0;
  if (!rotation.value) return 0;
  if (rotation.value === 90) return -spriteSize;
  if (rotation.value === 180) return -spriteSize * 2;
  if (rotation.value === 270) return -spriteSize * 3;
};

const selectedInteractableId = ref<string | null>(null);
const interactableSearch = ref('');
const fitleredInteractables = computed(() => {
  return Object.entries(INTERACTABLES)
    .map(([name, ctor]) => {
      // @ts-expect-error I'm sorry future me but I will go to great lengths to avoid maintaining a lookup table
      const instance = new ctor({}, { position: { x: 0, y: 0, z: 0 } });
      const id = instance.spriteId;
      return {
        name,
        src: interactableImagesPaths[id]
      };
    })
    .filter(({ name }) =>
      name.toLowerCase().includes(interactableSearch.value.toLowerCase())
    );
});

const currentTab = ref<'tiles' | 'interactables'>('tiles');
watchEffect(() => {
  switch (currentTab.value) {
    case 'interactables':
      selectedSprite.value = null;
      selectedTileId.value = null;
      break;
    case 'tiles':
      selectedInteractableId.value = null;
  }
});
</script>

<template>
  <div class="map-editor">
    <header class="flex gap-3 items-center">
      <UiButton @click="map = makeDefaultMap()">New map</UiButton>

      <PopoverRoot>
        <PopoverTrigger aria-label="see maps">
          <UiButton>Load</UiButton>
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent side="bottom" :side-offset="5" class="surface maps-dropdown">
            <ul v-if="maps">
              <li v-for="savedMap in maps" :key="savedMap.id">
                <button @click="makeMap(savedMap)">
                  {{ savedMap.name }}
                </button>
              </li>
            </ul>
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
      <UiButton @click="save">Save</UiButton>

      <UiButton
        :style="{
          '--ui-button-size': 'var(--font-size-4)',
          transform: 'rotateY(180deg)'
        }"
        @click="
          () => {
            rotation = ((rotation + 360 - 90) % 360) as 0 | 90 | 180 | 270;
          }
        "
      >
        <Icon name="mdi:rotate-360" />
      </UiButton>
      <UiButton
        :style="{ '--ui-button-size': 'var(--font-size-4)' }"
        @click="
          () => {
            rotation = ((rotation + 360 + 90) % 360) as 0 | 90 | 180 | 270;
          }
        "
      >
        <Icon name="mdi:rotate-360" />
      </UiButton>
      <UiButton :style="{ '--ui-button-size': 'var(--font-size-4)' }" @click="undo">
        <Icon name="mdi:undo" />
      </UiButton>
      <UiButton :style="{ '--ui-button-size': 'var(--font-size-4)' }" @click="redo">
        <Icon name="mdi:redo" />
      </UiButton>
      <UiButton
        :style="{ '--ui-button-size': 'var(--font-size-4)' }"
        :class="actionMode === 'add' && 'selected'"
        @click="actionMode = 'add'"
      >
        <Icon name="material-symbols:edit-outline" />
      </UiButton>
      <UiButton
        :style="{ '--ui-button-size': 'var(--font-size-4)' }"
        :class="actionMode === 'remove' && 'selected'"
        @click="actionMode = 'remove'"
      >
        <Icon name="bi:eraser-fill" />
      </UiButton>
      <UiButton
        @click="
          () => {
            isPlacingPlayer1 = true;
            isPlacingPlayer2 = false;
          }
        "
      >
        Player 1
      </UiButton>
      <UiButton
        @click="
          () => {
            isPlacingPlayer1 = false;
            isPlacingPlayer2 = true;
          }
        "
      >
        Player 2
      </UiButton>

      <span>Rotation : {{ rotation }} DEG</span>
    </header>

    <aside class="surface">
      <section>
        <h2>Map infos</h2>
        <fieldset @keydown.stop>
          <label>
            Name
            <input v-model="map.name" class="flex-1" />
          </label>
          <div class="flex gap-3">
            <label>
              xSize
              <input v-model="map.width" type="number" :max="MAX_X" :min="1" step="1" />
            </label>
            <label>
              ySize
              <input v-model="map.height" type="number" :max="MAX_Y" :min="1" step="1" />
            </label>
          </div>
        </fieldset>
        <label for="placement-mode">Placement mode</label>
        <div class="flex gap-2 mb-3">
          Tile
          <SwitchRoot
            id="placement-mode"
            :checked="placeMode == 'sprite'"
            class="w-[42px] h-[25px] focus-within:outline focus-within:outline-black flex bg-black/50 shadow-sm rounded-full relative data-[state=checked]:bg-black cursor-default"
            @update:checked="placeMode = $event ? 'sprite' : 'tile'"
          >
            <SwitchThumb
              class="block w-[21px] h-[21px] my-auto bg-white shadow-sm rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]"
            />
          </SwitchRoot>
          Sprite
        </div>
      </section>

      <TabsRoot v-model="currentTab">
        <TabsList class="flex gap-2">
          <TabsTrigger value="tiles" class="tab-trigger">Tiles</TabsTrigger>
          <TabsTrigger value="interactables" class="tab-trigger">
            Interactables
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tiles">
          <section>
            <h2>Tiles</h2>
            <section class="menu-list">
              <button
                v-for="(tile, name) in TILES"
                :key="name"
                :title="name"
                :style="{
                  '--bg': `url(${
                    tileImagesPaths[
                      TILE_TO_EDITOR_SPRITE[name as keyof typeof TILE_TO_EDITOR_SPRITE]
                    ]
                  })`
                }"
                :class="selectedTileId === name && 'selected'"
                @click="selectedTileId = name"
              />
            </section>
          </section>
          <section>
            <h2>Sprites</h2>
            <label @keydown.stop>
              Search a sprite
              <input v-model="spriteSearch" class="flex-1" />
            </label>
            <section class="menu-list">
              <template v-for="{ src, name } in fitleredSprites" :key="name">
                <button
                  v-if="isString(name) && !name.startsWith('editor')"
                  :style="{
                    '--bg': `url(${src})`,
                    '--bg-offset': getSpriteIconOffset(name)
                  }"
                  :title="name"
                  :class="selectedSprite === name && 'selected'"
                  @click="selectedSprite = name"
                />
              </template>
            </section>
          </section>
          <section>
            <h2>Visible floors</h2>
            <section>
              <fieldset class="floors">
                <label v-for="(_, floor) in visibleFloors" :key="floor">
                  <input v-model="visibleFloors[floor]" type="checkbox" />
                  Floor {{ floor }}
                </label>
              </fieldset>
            </section>
          </section>
        </TabsContent>

        <TabsContent value="interactables">
          <section>
            <h2>Interactables</h2>
            <label @keydown.stop>
              Search an interactable
              <input v-model="interactableSearch" class="flex-1" />
            </label>
            <section class="menu-list">
              <template v-for="{ src, name } in fitleredInteractables" :key="name">
                <button
                  v-if="isString(name) && !name.startsWith('editor')"
                  :style="{
                    '--bg': `url(${src})`,
                    '--bg-offset': -16
                  }"
                  :title="name"
                  :class="selectedInteractableId === name && 'selected'"
                  @click="selectedInteractableId = name"
                />
              </template>
            </section>
          </section>
        </TabsContent>
      </TabsRoot>
    </aside>

    <main ref="canvasContainer" @contextmenu.prevent @mouseleave="isDragging = false">
      <Application v-if="isReady" :resize-to="canvasContainer" :antialias="false">
        <MapEditorRenderer
          v-model:map="map"
          :assets="assets"
          :rotation="rotation"
          :visible-floors="visibleFloors"
          :place-mode="placeMode"
          @cell-pointerup="onCellPointerup"
          @cell-pointerdown="onCellPointerdown"
          @cell-pointerenter="onCellPointerenter"
        />
      </Application>

      <div class="help surface">
        <code>Click: replace / remove sprites on cell</code>
        <code>
          <kbd>Ctrl</kbd>
          + click : remove sprites on cell
        </code>
        <code>
          <kbd>Shift</kbd>
          + click : add new cell above
        </code>
        <code>
          <kbd>Alt</kbd>
          + click: toggle sprite on cell
        </code>
      </div>
    </main>
  </div>
</template>

<style scoped lang="postcss">
button {
  cursor: pointer;
  &.selected {
    outline: solid var(--border-size-2) var(--primary);
  }
}
.map-editor {
  overflow: hidden;
  display: grid;
  grid-template-columns: var(--size-sm) 1fr;
  grid-template-rows: auto 1fr;

  height: 100vh;
}

header {
  grid-column: 1 / -1;
  padding: var(--size-2);
}

aside {
  overflow-y: auto;
  height: 100%;

  section {
    margin-block-end: var(--size-3);

    & :is(label, h2) {
      margin-block-end: var(--size-2);
      font-size: var(--font-size-0);
      font-weight: var(--font-size-5);
      color: var(--text-2);
    }
  }
}

.menu-list {
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-3);

  max-height: 20rem;
  margin-right: calc(-1 * var(--size-4));
  padding: var(--size-1);

  > button {
    --x-offset: calc(-16px + calc(1px * var(--bg-offset, 0)));

    cursor: pointer;

    aspect-ratio: 1;
    width: 64px;

    font-size: var(--font-size-0);
    text-align: left;
    text-transform: uppercase;

    background-image: var(--bg);
    background-position-x: var(--x-offset);
    background-position-y: -16px;

    &:hover {
      filter: brightness(120%);
    }

    > small {
      font-size: var(--font-size-00);
      text-transform: lowercase;
    }
  }
}

main {
  position: relative;
}

.help {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0;
  code {
    display: block;

    padding-block: var(--size-1);
    padding-inline: var(--size-3);

    font-size: var(--font-size-0);

    background: transparent;
    &:first-of-type {
      padding-block-start: var(--size-3);
    }
    &:last-of-type {
      padding-block-end: var(--size-3);
    }
  }
}

label {
  display: flex;
  gap: var(--size-2);
  align-items: center;
  margin-block-end: var(--size-1);
}

.floors {
  display: flex;
  flex-direction: column-reverse;
}

:global(.maps-dropdown) {
  padding: var(--size-2);
  box-shadow: var(--shadow-2);
}

.tab-trigger {
  color: var(--text-2);
  border: solid var(--border-size-1) var(--border-dimmed);
  border-bottom-color: transparent;

  &[data-state='active'] {
    color: var(--text-1);
    border-bottom-color: var(--primary);
  }
}
</style>
../../assets/tiles{m} ../../assets/interactables{m}
