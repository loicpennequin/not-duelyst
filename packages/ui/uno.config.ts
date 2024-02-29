import path from 'path';
import { createUnoConfig } from '@hc/unocss-config';

export default createUnoConfig({
  themePath: path.join(__dirname, 'styles/theme.css'),
  additional: [`../packages/ui`, `../packages/game-client`]
});
