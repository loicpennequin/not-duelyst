import path from 'path';
import { createUnoConfig } from '@hc/unocss-config';

export default createUnoConfig({
  themePath: path.join(__dirname, 'src/styles/theme.css'),
  additional: []
});
