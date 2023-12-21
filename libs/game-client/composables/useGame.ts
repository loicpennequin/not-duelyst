import {
  GameSession,
  type GameState,
  type Point3D,
  type UnitBlueprint,
  type UnitId,
  type EntityId,
  type Skill,
  type SkillId,
  Cell,
  type Player,
  type Entity
} from '@hc/sdk';
import type { Values, UnionToIntersection, Nullable } from '@hc/shared';
import { Layer } from '@pixi/layers';
import type { Viewport } from 'pixi-viewport';
import type { AnimatedSprite } from 'pixi.js';

type ShortEmits<T extends Record<string, any>> = UnionToIntersection<
  Values<{
    [K in keyof T]: (evt: K, ...args: T[K]) => void;
  }>
>;

export type GameEmits = {
  move: [Point3D & { entityId: EntityId }];
  'end-turn': [];
  'use-skill': [{ skillId: SkillId; targets: Point3D[] }];
  summon: [{ unitId: UnitId; position: Point3D }];
  end: [{ winner: Player }];
};

export type GameContext = {
  state: Ref<GameState>;
  gameSession: GameSession;
  sendInput: ShortEmits<GameEmits>;
  mapRotation: Ref<0 | 90 | 180 | 270>;
  assets: AssetsContext;
  utils: {
    isMoveTarget(point: Point3D): boolean;
    isWithinRangeOfSkill(point: Point3D): boolean;
    isSummonTarget(point: Point3D): boolean;
    isSkillTarget(point: Point3D): boolean;
  };
  ui: {
    skillTargets: Ref<Set<Point3D>>;
    hoveredCell: Ref<Nullable<Cell>>;
    distanceMap: ComputedRef<ReturnType<GameSession['map']['getDistanceMap']>>;
    targetMode: Ref<Nullable<'move' | 'skill' | 'summon'>>;
    selectedSkill: Ref<Nullable<Skill>>;
    selectedSummon: Ref<Nullable<UnitBlueprint>>;
    selectedEntity: Ref<Nullable<Entity>>;
    layers: {
      gameObjects: Ref<Layer | undefined>;
      ui: Ref<Layer | undefined>;
    };
  };
  fx: {
    isMoving: Ref<boolean>;
    viewport?: Viewport;
    spriteMap: Map<EntityId, MaybeRefOrGetter<AnimatedSprite | undefined>>;
  };
};

export const GAME_INJECTION_KEY = Symbol('game') as InjectionKey<GameContext>;

export const useGameProvider = (session: GameSession, emit: ShortEmits<GameEmits>) => {
  const assets = useAssetsProvider();
  const state = ref<GameState>(session.getState());
  const unsub = session.subscribe(action => {
    const newState = session.getState();
    state.value = newState;

    if (action.name === 'END_GAME') {
      emit('end', { winner: session.playerManager.getPlayerById(session.winner!)! });
    }
  });
  onUnmounted(unsub);

  const distanceMap = computed(() => {
    return session.map.getDistanceMap(
      state.value.activeEntity.position,
      state.value.activeEntity.speed
    );
  });

  const context: GameContext = {
    assets,
    state: state as Ref<GameState>,
    gameSession: session,
    sendInput: (type, payload?) => {
      // @ts-expect-error
      emit(type, payload);
      context.ui.targetMode.value = null;
      context.ui.selectedSkill.value = null;
      context.ui.selectedSummon.value = null;
    },
    mapRotation: ref(0),
    ui: {
      skillTargets: ref(new Set()),
      distanceMap,
      targetMode: ref(null),
      hoveredCell: ref(null),
      selectedEntity: ref(null),
      selectedSkill: ref(null),
      selectedSummon: ref(null),
      layers: {
        gameObjects: ref(),
        ui: ref()
      }
    },
    utils: {
      isMoveTarget(point) {
        if (context.ui.targetMode.value !== 'move') return false;
        return state.value.activeEntity.canMove(distanceMap.value.get(point));
      },
      isWithinRangeOfSkill(point) {
        if (context.ui.targetMode.value !== 'skill') return false;
        if (!context.ui.selectedSkill.value) return false;

        return context.ui.selectedSkill.value.isWithinRange(
          session,
          point,
          context.state.value.activeEntity,
          [...context.ui.skillTargets.value.values()]
        );
      },
      isSummonTarget(point) {
        if (context.ui.targetMode.value !== 'summon') return false;

        return session.map.canSummonAt(point);
      },
      isSkillTarget(point) {
        if (context.ui.targetMode.value !== 'skill') return false;
        if (!context.ui.selectedSkill.value) return false;

        return context.ui.selectedSkill.value.isTargetable(
          session,
          point,
          context.state.value.activeEntity,
          [...context.ui.skillTargets.value.values()]
        );
      }
    },
    fx: {
      isMoving: ref(false),
      viewport: undefined,
      spriteMap: new Map()
    }
  };

  useInstallFxContext(context);

  watchEffect(() => {
    if (context.ui.selectedSkill.value) {
      context.ui.targetMode.value = 'skill';
      context.ui.selectedSummon.value = null;
    }
  });
  watchEffect(() => {
    if (context.ui.selectedSummon.value) {
      context.ui.targetMode.value = 'summon';
      context.ui.selectedSkill.value = null;
    }
  });
  watchEffect(() => {
    if (context.ui.targetMode.value === 'move') {
      context.ui.selectedSummon.value = null;
      context.ui.selectedSkill.value = null;
    }
  });

  watch(context.ui.targetMode, newMode => {
    if (newMode !== 'skill') {
      context.ui.skillTargets.value.clear();
    }
  });
  provide(GAME_INJECTION_KEY, context);

  return context;
};

export const useGame = () => useSafeInject(GAME_INJECTION_KEY);

export const useGameUi = () => useGame().ui;
