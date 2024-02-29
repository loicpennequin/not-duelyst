import type { SerializedGameState } from '@hc/sdk';
import fs from 'fs-extra';
import path from 'path';

const MAP_DIR = path.join(process.cwd(), 'server/maps');
export default defineEventHandler(async event => {
  const { name, ...body } = await readBody(event);
  await fs.writeJSON(path.join(MAP_DIR, `${name}.json`), body);

  return { success: true };
});
