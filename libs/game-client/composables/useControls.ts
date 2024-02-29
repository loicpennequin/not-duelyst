import type { ControlId } from '../utils/key-bindings';

type Angle = 0 | 90 | 180 | 270;

export const useGameControls = () => {
  const { state, gameSession, mapRotation, ui, sendInput, fx, isActivePlayer } =
    useGame();

  const settings = useUserSettings();

  const rotateMap = (diff: number) => {
    mapRotation.value = ((mapRotation.value + 360 + diff) % 360) as Angle;
  };

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
      let selectedEntity = ui.selectedEntity.value;
      const activePlayer = state.value.activePlayer;

      if (!selectedEntity) {
        ui.selectedEntity.value = activePlayer.general;
        selectedEntity = activePlayer.general;
      } else {
        const player = selectedEntity.player;
        const entities = player.entities;
        const index = entities.findIndex(e => e.equals(selectedEntity!));
        let newIndex = index + diff;
        if (newIndex >= entities.length) {
          ui.selectedEntity.value = player.general;
        } else {
          if (newIndex < 0) newIndex = entities.length - 1;
          ui.selectedEntity.value = entities[newIndex];
        }
      }
      console.log(selectedEntity);
      const spriteRef = fx.spriteMap.get(selectedEntity!.id);
      if (!spriteRef) return;
      const sprite = toValue(spriteRef);
      if (!sprite) return;

      fx.viewport?.moveCenter(sprite.position);
    };

    const cleanup = useEventListener('keydown', e => {
      if (ui.isMenuOpened.value) return;
      if (e.repeat) return;

      if (isMatch(e, 'rotateMapLeft')) {
        rotateMap(-90);
      }

      if (isMatch(e, 'rotateMapRight')) {
        rotateMap(90);
      }

      if (isMatch(e, 'nextUnit')) {
        selectEntity(1);
      }
      if (isMatch(e, 'prevUnit')) {
        selectEntity(-1);
      }

      if (!toValue(isActivePlayer)) return;
      if (isMatch(e, 'endTurn')) sendInput('end-turn');

      if (!ui.selectedEntity.value?.player.equals(state.value.activePlayer)) {
        return;
      }

      ui.selectedEntity.value.skills.forEach((skill, index) => {
        if (isMatch(e, `skill${index + 1}` as ControlId)) {
          ui.selectedSkill.value = skill;
        }
      });

      gameSession.playerManager
        .getActivePlayer()
        .summonableUnits.forEach((unit, index) => {
          if (isMatch(e, `summon${index + 1}` as ControlId)) {
            ui.selectedSummon.value = unit.unit;
          }
        });
    });

    onCleanup(cleanup);
  });
};
