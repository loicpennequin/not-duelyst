import type { KeyBinding } from '~/components/ui/UiKeyInput.vue';

export const defaultBindings: { id: string; label: string; control: KeyBinding }[] = [
  {
    id: 'rotateMapLeft',
    label: 'Rotate map Left',
    control: { key: 'KeyQ', modifier: null }
  },
  {
    id: 'rotateMapRight',
    label: 'Rotate map Right',
    control: { key: 'KeyE', modifier: null }
  },
  {
    id: 'skill1',
    label: 'Unit skill 1',
    control: { key: 'Digit1', modifier: null }
  },
  {
    id: 'skill2',
    label: 'Unit skill 2',
    control: { key: 'Digit2', modifier: null }
  },
  {
    id: 'skill3',
    label: 'Unit skill 3',
    control: { key: 'Digit3', modifier: null }
  },
  {
    id: 'skill4',
    label: 'Unit skill 4',
    control: { key: 'Digit4', modifier: null }
  },
  {
    id: 'summon1',
    label: 'Summon unit 1',
    control: { key: 'Digit1', modifier: 'shift' }
  },
  {
    id: 'summon2',
    label: 'Summon unit 2',
    control: { key: 'Digit2', modifier: 'shift' }
  },
  {
    id: 'summon3',
    label: 'Summon unit 3',
    control: { key: 'Digit3', modifier: 'shift' }
  },
  {
    id: 'summon4',
    label: 'Summon unit 4',
    control: { key: 'Digit4', modifier: 'shift' }
  },
  {
    id: 'summon5',
    label: 'Summon unit 5',
    control: { key: 'Digit5', modifier: 'shift' }
  },
  {
    id: 'summon6',
    label: 'Summon unit 6',
    control: { key: 'Digit6', modifier: 'shift' }
  },
  {
    id: 'endTurn',
    label: 'End turn',
    control: { key: 'KeyT', modifier: null }
  },
  {
    id: 'nextUnit',
    label: 'Next unit',
    control: { key: 'Tab', modifier: null }
  },
  {
    id: 'prevUnit',
    label: 'Previous unit',
    control: { key: 'Tab', modifier: 'shift' }
  }
];

export type ControlId = (typeof defaultBindings)[number]['id'];
