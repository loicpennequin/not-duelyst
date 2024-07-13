import type { EntityId } from '@game/sdk';
import { AnimatedSprite, Texture, type FrameObject } from 'pixi.js';

export const useEntityTexture = (
  entityId: EntityId,
  sprite: Ref<AnimatedSprite | undefined>
) => {
  const { fx, assets } = useGame();
  const entity = useGameSelector(
    session => session.entitySystem.getEntityById(entityId)!
  );
  const textures = ref<FrameObject[]>([{ texture: Texture.EMPTY, time: 100 }]) as Ref<
    FrameObject[]
  >;

  const animationName = computed(
    () => fx.entityAnimationsMap.value.get(entityId) ?? 'breathing'
  );

  const setTextures = async () => {
    if (!entity.value) return;
    const diffuseSheet = await assets.loadSpritesheet(
      entity.value.card.blueprint.spriteId
    );

    textures.value = createSpritesheetFrameObject(animationName.value, diffuseSheet);
  };
  setTextures();

  watch(animationName, (newAnimation, oldAnimation) => {
    const updateAnimation = () => {
      setTextures();
      nextTick(() => {
        if (!sprite.value) return;
        sprite.value?.gotoAndPlay?.(0);
      });
    };

    const updateAnimationDelayed = () => {
      if (!sprite.value) return;
      sprite.value.onLoop = sprite.value.onComplete = () => {
        sprite.value!.onLoop = undefined;
        sprite.value!.onComplete = undefined;
        updateAnimation();
      };
    };
    if (newAnimation === 'breathing' && oldAnimation === 'idle') {
      updateAnimationDelayed();
    } else {
      updateAnimation();
    }
  });

  return textures;
};
