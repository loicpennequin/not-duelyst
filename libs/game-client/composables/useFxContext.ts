import { Text, AnimatedSprite, Container, Sprite } from 'pixi.js';
import { sfxPaths } from '../assets/sfx{m}';
import { Howl } from 'howler';

export const useInstallFxContext = ({ gameSession, state, fx, assets }: GameContext) => {
  const visibility = useDocumentVisibility();
  const isHidden = computed(() => visibility.value === 'hidden');
  const settings = useUserSettings();

  gameSession.fxContext = {
    displayText(text, entityId, { color, path, duration }) {
      if (isHidden.value) return Promise.resolve();

      return new Promise(resolve => {
        const entity = gameSession.entityManager.getEntityById(entityId);
        if (!entity) {
          console.warn(`FXContext: entity not found for entityId ${entityId}`);
          return resolve();
        }

        const sprite = toValue(fx.spriteMap.get(entityId));
        if (!sprite) {
          console.warn(`FXContext: sprite not found for entity ${entityId}`);
          return resolve();
        }

        const container = new Container();
        container.position.set(
          sprite.parent.parent.position.x,
          sprite.parent.parent.position.y + 16
        );
        container.zIndex = sprite.parent.parent.zIndex + 1;
        container.zOrder = sprite.parent.parent.zIndex + 1;

        const textSprite = new Text(text, {
          fontSize: 30,
          fontWeight: '700',
          fill: color,
          stroke: 'black',
          strokeThickness: 4
        });
        container.addChild(textSprite);
        // gsap motionpath doesn't work with gsap pixi plugin, so we apply values to a dummy object and update the text on update
        const sentinel = Object.assign({ x: 0, y: 0, scale: 1, alpha: 1 }, path.shift()!);

        const onUpdate = () => {
          textSprite.position.set(sentinel.x, sentinel.y);
          // we divide the scale by 2 to avoid pixelated text since the game is zoomed in by default
          textSprite.scale.set(sentinel.scale * 0.5, sentinel.scale * 0.5);
          textSprite.alpha = sentinel.alpha;
        };
        onUpdate(); // set starting values on sprite

        (fx.viewport?.children[0] as Container).addChild(container);
        gsap.to(sentinel, {
          motionPath: {
            path
          },
          duration,
          onUpdate,
          ease: Power2.easeOut,
          onComplete: () => {
            container.destroy();
            resolve();
          }
        });
      });
    },

    playSoundOnce(soundId, { fallback, percentage = 1, slice } = {}) {
      if (isHidden.value) return Promise.resolve();

      return new Promise<void>(resolve => {
        if (isHidden.value) return resolve();

        const soundPath = sfxPaths[soundId] ?? sfxPaths[fallback ?? ''];
        if (!soundPath) {
          console.log(`FXContext: sound not found: ${soundId}, fallback ${fallback}`);
          return resolve();
        }

        const sfx = new Howl({
          src: [soundPath],
          volume: settings.value.sound.musicVolume[0] / 100,
          sprite: slice
            ? {
                slice: slice
              }
            : undefined,
          onplay() {
            const durationSeconds = sfx.duration();

            setTimeout(
              () => {
                resolve();
              },
              durationSeconds * 1000 * percentage
            );
          }
        });
        sfx.play(slice ? 'slice' : undefined);
      });
    },

    playSoundUntil(soundId, { fallback, slice } = {}) {
      if (isHidden.value) return () => void 0;

      const soundPath = sfxPaths[soundId] ?? sfxPaths[fallback ?? ''];
      if (!soundPath) {
        console.log(`FXContext: sound not found: ${soundId}, fallback ${fallback}`);
        return () => void 0;
      }

      const sfx = new Howl({
        src: [soundPath],
        sprite: slice
          ? {
              slice: slice
            }
          : undefined,
        volume: settings.value.sound.musicVolume[0] / 100,
        loop: true
      });

      sfx.play(slice ? 'slice' : undefined);

      return () => {
        sfx.on('end', () => {
          sfx.stop();
        });
      };
    },

    playAnimationOnce(
      entityId,
      animationName,
      { animationNameFallback = 'idle', framePercentage = 1 } = {}
    ) {
      if (isHidden.value) return Promise.resolve();

      return new Promise<void>(resolve => {
        const entity = gameSession.entityManager.getEntityById(entityId);
        if (!entity) {
          console.warn(`FXContext: entity not found for entityId ${entityId}`);
          return resolve();
        }

        const sprite = toValue(fx.spriteMap.get(entityId));
        if (!sprite) {
          console.warn(`FXContext: sprite not found for entity ${entityId}`);
          return resolve();
        }

        const sheet = assets.getSpritesheet(entity.unit.spriteId, 'placeholder-unit');
        const animation =
          sheet.animations[animationName] ?? sheet.animations[animationNameFallback];
        if (!animation) {
          console.warn(
            `FXContext: animation not found on sprite ${entity.unitId}: ${animationName}.`
          );
          return resolve();
        }

        sprite.textures = createSpritesheetFrameObject(
          sheet.animations[animationName] ? animationName : animationNameFallback,
          sheet
        );
        sprite.loop = false;
        sprite.gotoAndPlay(0);

        sprite.onFrameChange = frame => {
          if (frame >= sprite.totalFrames * framePercentage) {
            resolve();
            sprite.onFrameChange = undefined;
          }
        };

        sprite.onComplete = () => {
          sprite.textures = createSpritesheetFrameObject('idle', sheet);
          sprite.loop = true;
          sprite.gotoAndPlay(0);
          sprite.onComplete = undefined;
          sprite.onFrameChange = undefined;
          resolve();
        };

        if (framePercentage === 0) {
          resolve();
        }
      });
    },

    playAnimationUntil(entityId, animationName, { animationNameFallback = 'idle' } = {}) {
      if (isHidden.value) return () => void 0;

      const entity = gameSession.entityManager.getEntityById(entityId);
      if (!entity) {
        console.warn(`FXContext: entity not found for entityId ${entityId}`);
        return () => void 0;
      }

      const sprite = toValue(fx.spriteMap.get(entityId));
      if (!sprite) {
        console.warn(`FXContext: sprite not found for entity ${entityId}`);
        return () => void 0;
      }

      const sheet = assets.getSpritesheet(entity.unit.spriteId, 'placeholder-unit');
      sheet.animations;
      const hasAnimation = !!sheet.animations[animationName];
      if (!hasAnimation) {
        console.warn(
          `FXContext: animation not found on sprite : ${animationName}. Using fallback ${animationNameFallback}`
        );
        return () => void 0;
      }

      sprite.textures = createSpritesheetFrameObject(
        hasAnimation ? animationName : animationNameFallback,
        sheet
      );
      sprite.loop = true;
      sprite.gotoAndPlay(0);

      return () => {
        sprite.textures = createSpritesheetFrameObject('idle', sheet);
        sprite.loop = true;
        sprite.gotoAndPlay(0);
      };
    },

    moveEntity(entityId, point, duration) {
      if (isHidden.value) return Promise.resolve();

      return new Promise<void>(resolve => {
        fx.isMoving.value = true;
        // we are grabbing the entity from the reactive state instead of entityManager otherwise the movement won't be rendered !
        // It's ok because the position wil be updated when the action execution is flushed after the fx sequence
        const entity = state.value.entities.find(e => e.id === entityId);
        if (!entity) {
          console.warn(`FXContext: entity not found for entityId ${entityId}`);
          return resolve();
        }

        gsap.to(entity.position, {
          x: point.x,
          y: point.y,
          z: point.z,
          duration,
          ease: Power0.easeNone,
          onComplete() {
            // we are waiting for nextTick because we dont want the entity position to be tweened again when the state update from the action happens
            nextTick(() => {
              fx.isMoving.value = false;
            });
            resolve();
          }
        });
      });
    },

    shakeEntity(
      entityId,
      { count = 5, totalDuration = 1, axis = 'x', amount = 10 } = {}
    ) {
      if (isHidden.value) return Promise.resolve();

      return new Promise(resolve => {
        const entity = gameSession.entityManager.getEntityById(entityId);
        if (!entity) {
          console.warn(`FXContext: entity not found for entityId ${entityId}`);
          return resolve();
        }

        const sprite = toValue(fx.spriteMap.get(entityId));
        if (!sprite) {
          console.warn(`FXContext: sprite not found for entity ${entityId}`);
          return resolve();
        }
        fx.isMoving.value = true;

        const { x, y } = sprite.position;
        gsap.fromTo(
          sprite,
          {
            pixi: {
              x: axis === 'x' || axis === 'both' ? amount : 0,
              y: axis === 'y' || axis === 'both' ? amount : 0
            }
          },
          {
            duration: totalDuration / count,
            ease: Power0.easeNone,
            yoyo: true,
            onComplete: () => {
              fx.isMoving.value = false;
              sprite.position.x = x;
              sprite.position.y = y;
              resolve();
            },
            repeat: count,
            pixi: {
              x: axis === 'x' || axis === 'both' ? -amount : 0,
              y: axis === 'y' || axis === 'both' ? -amount : 0
            }
          }
        );
      });
    },

    fadeOutEntity(entityId, duration) {
      if (isHidden.value) return Promise.resolve();

      return new Promise(resolve => {
        const entity = gameSession.entityManager.getEntityById(entityId);
        if (!entity) {
          console.warn(`FXContext: entity not found for entityId ${entityId}`);
          return resolve();
        }

        const sprite = toValue(fx.spriteMap.get(entityId));
        if (!sprite) {
          console.warn(`FXContext: sprite not found for entity ${entityId}`);
          return resolve();
        }

        gsap.to(sprite, {
          duration,
          ease: Power2.easeOut,
          onComplete: resolve,
          pixi: {
            alpha: 0
          }
        });
      });
    },

    addChildSpriteFor(
      spriteId,
      entityId,
      { onEnter, onLeave, duration = 2000, offset = { x: 0, y: 0 }, scale = 1 } = {}
    ) {
      return new Promise<void>(resolve => {
        if (isHidden.value) return resolve();

        const entity = gameSession.entityManager.getEntityById(entityId);
        if (!entity) {
          console.warn(`FXContext: entity not found for entityId ${entityId}`);
          return resolve();
        }

        const entitySprite = toValue(fx.spriteMap.get(entityId));
        if (!entitySprite) {
          console.warn(`FXContext: sprite not found for entity ${entityId}`);
          return resolve();
        }

        const texture = assets.getTexture(spriteId);

        const container = new Container();
        container.position.set(
          entitySprite.parent.parent.position.x,
          entitySprite.parent.parent.position.y
        );
        container.zIndex = entitySprite.parent.parent.zIndex + 1;
        container.zOrder = entitySprite.parent.parent.zIndex + 1;
        (fx.viewport?.children[0] as Container).addChild(container);

        const fxSprite = new Sprite(texture);
        fxSprite.position.set(offset.x, offset.y);
        fxSprite.anchor.set(0.5);
        fxSprite.scale = { x: scale, y: scale };

        container.addChild(fxSprite);

        if (onEnter) {
          gsap.fromTo(
            fxSprite,
            {
              pixi: {
                alpha: onEnter.animation.includes('fade-in') ? 0 : 1,
                x: onEnter.animation.includes('slide-in-left')
                  ? offset.x - 15
                  : onEnter.animation.includes('slide-in-right')
                    ? offset.x + 15
                    : offset.x,
                y: onEnter.animation.includes('slide-in-top')
                  ? offset.y - 15
                  : onEnter.animation.includes('slide-in-bottom')
                    ? offset.y + 15
                    : offset.y
              }
            },
            {
              duration: onEnter.duration / 1000,
              ease: Power2.easeOut,
              pixi: {
                x: offset.x,
                y: offset.y,
                alpha: 1
              }
            }
          );
        }

        setTimeout(() => {
          container.destroy();
          resolve();
        }, duration);
      });
    },

    addChildSpriteUntil(spriteId, entityId, { offset = { x: 0, y: 0 }, scale = 1 } = {}) {
      if (isHidden.value) return () => void 0;

      const entity = gameSession.entityManager.getEntityById(entityId);
      if (!entity) {
        console.warn(`FXContext: entity not found for entityId ${entityId}`);
        return () => void 0;
      }

      const sprite = toValue(fx.spriteMap.get(entityId));
      if (!sprite) {
        console.warn(`FXContext: sprite not found for entity ${entityId}`);
        return () => void 0;
      }

      const texture = assets.getTexture(spriteId);

      const container = new Container();
      container.position.set(
        sprite.parent.parent.position.x,
        sprite.parent.parent.position.y
      );
      container.zIndex = sprite.parent.parent.zIndex + 1;
      container.zOrder = sprite.parent.parent.zIndex + 1;
      (fx.viewport?.children[0] as Container).addChild(container);

      const fxSprite = new Sprite(texture);
      fxSprite.position.set(offset.x, offset.y);
      fxSprite.anchor.set(0.5);
      fxSprite.scale = { x: scale, y: scale };

      container.addChild(fxSprite);

      return () => {
        container.destroy();
      };
    },

    addChildAnimatedSprite(
      spriteId,
      entityId,
      {
        animationName = 'idle',
        offset = { x: 0, y: 0 },
        waitUntilAnimationDone = true,
        scale = 1
      } = {}
    ) {
      if (isHidden.value) return Promise.resolve();

      return new Promise(resolve => {
        const entity = gameSession.entityManager.getEntityById(entityId);
        if (!entity) {
          console.warn(`FXContext: entity not found for entityId ${entityId}`);
          return resolve();
        }

        const sprite = toValue(fx.spriteMap.get(entityId));
        if (!sprite) {
          console.warn(`FXContext: sprite not found for entity ${entityId}`);
          return resolve();
        }

        const sheet = assets.getSpritesheet(spriteId);
        const hasAnimation = !!sheet.animations[animationName];
        if (!hasAnimation) {
          console.warn(
            `FXContext: animation not found on sprite ${spriteId} : ${animationName}.`
          );
          return resolve();
        }

        const container = new Container();
        container.position.set(
          sprite.parent.parent.position.x,
          sprite.parent.parent.position.y
        );
        container.zIndex = sprite.parent.parent.zIndex + 1;
        container.zOrder = sprite.parent.parent.zIndex + 1;
        (fx.viewport?.children[0] as Container).addChild(container);

        const fxSprite = new AnimatedSprite(createSpritesheetFrameObject('idle', sheet));
        fxSprite.position.set(offset.x, offset.y);
        fxSprite.loop = false;
        fxSprite.anchor.set(0.5);
        fxSprite.scale = { x: scale, y: scale };
        fxSprite.onComplete = () => {
          container.destroy();
          resolve();
        };

        container.addChild(fxSprite);

        fxSprite.play();

        if (!waitUntilAnimationDone) {
          resolve();
        }
      });
    }
  };
};
