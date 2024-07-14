import { config } from '@game/sdk';
import type { ControlId } from '../utils/key-bindings';

export const useGameControls = () => {
  const { camera, ui, dispatch, fx } = useGame();

  const activePlayer = useGameSelector(session => session.playerSystem.activePlayer);
  const { settings } = useUserSettings();
  const isActivePlayer = useIsActivePlayer();

  watchEffect(onCleanup => {
    const controls = settings.value.bindings;

    const isMatch = (e: KeyboardEvent, id: ControlId) => {
      const control = controls.find(c => c.id === id)!.control;
      if (e.code !== control.key) return false;
      const match =
        (control.modifier === null && !e.shiftKey && !e.ctrlKey && !e.altKey) ||
        (control.modifier == 'shift' && e.shiftKey) ||
        (control.modifier == 'alt' && e.altKey) ||
        (control.modifier == 'ctrl' && e.ctrlKey);

      if (match) {
        e.preventDefault();
      }
      return match;
    };

    const selectEntity = (diff: number) => {
      if (!ui.selectedEntity.value) {
        ui.selectEntity(activePlayer.value.general.id);
      } else {
        const player = ui.selectedEntity.value.player;
        const entities = player.entities;
        const selected = ui.selectedEntity.value;
        const index = entities.findIndex(e => e.equals(selected));
        let newIndex = index + diff;
        if (newIndex >= entities.length) {
          ui.selectEntity(player.general.id);
        } else {
          if (newIndex < 0) newIndex = entities.length - 1;
          ui.selectEntity(entities[newIndex].id);
        }
      }
      const spriteRef = fx.entityRootMap.get(ui.selectedEntity.value!.id);
      if (!spriteRef) return;
      const sprite = toValue(spriteRef);
      if (!sprite) return;

      camera.viewport.value?.animate({
        time: settings.value.a11y.reducedMotions ? 0 : 200,
        position: {
          x: sprite.position.x + camera.offset.value.x,
          y: sprite.position.y + camera.offset.value.y
        },
        ease: 'easeInQuad'
      });
    };

    const cleanup = useEventListener('keydown', e => {
      if (ui.isMenuOpened.value) return;
      if (e.repeat) return;

      if (isMatch(e, 'rotateMapLeft')) {
        camera.rotateCCW();
      }

      if (isMatch(e, 'rotateMapRight')) {
        camera.rotateCW();
      }

      if (isMatch(e, 'nextUnit')) {
        selectEntity(1);
      }
      if (isMatch(e, 'prevUnit')) {
        selectEntity(-1);
      }

      if (!activePlayer.value) return;
      if (isMatch(e, 'endTurn')) dispatch('endTurn');
      if (isMatch(e, 'skipTargets')) {
        if (ui.targetingMode.value === TARGETING_MODES.TARGETING) {
          dispatch('playCard', {
            cardIndex: ui.selectedCardIndex.value!,
            position: ui.summonTarget.value ?? { x: 0, y: 0, z: 0 },
            targets: ui.cardTargets.value,
            cardChoices: ui.cardChoiceIndexes.value
          });
          ui.unselectCard();
        }
      }

      if (!isActivePlayer.value) return;

      for (let i = 0; i < config.MAX_HAND_SIZE; i++) {
        if (
          isMatch(e, `summon${i + 1}` as ControlId) &&
          activePlayer.value.canPlayCardAtIndex(i)
        ) {
          ui.selectCardAtIndex(i);
        }
        if (
          isMatch(e, `replace${i + 1}` as ControlId) &&
          activePlayer.value.canReplace() &&
          activePlayer.value.hand[i]
        ) {
          dispatch('replace', { cardIndex: i });
        }
      }
    });

    onCleanup(cleanup);
  });
};
