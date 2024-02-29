import type { SerializedGameState } from '@hc/sdk';
import fs from 'fs-extra';
import path from 'path';

const MAP_DIR = path.join(process.cwd(), 'server/maps');
export default defineEventHandler(async event => {
  const mapsDir = await fs.readdir(MAP_DIR);

  const mapFiles = mapsDir.filter(fileOrDir => {
    const isDirectory = fs.lstatSync(path.join(MAP_DIR, fileOrDir)).isDirectory();
    const isJson = fileOrDir.endsWith('.json');

    return !isDirectory && isJson;
  });

  const entries = mapFiles.map(filepath => {
    const key = filepath.replace('.json', '');
    const mapData = fs.readJSONSync(path.join(MAP_DIR, filepath));

    return [key, mapData] as [string, SerializedGameState['map']];
  });

  return Object.fromEntries(entries);
});
