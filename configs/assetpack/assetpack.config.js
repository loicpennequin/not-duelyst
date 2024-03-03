import { compressPng } from "@assetpack/plugin-compress";
import { audio } from "@assetpack/plugin-ffmpeg";
import { json } from "@assetpack/plugin-json";
import { pixiManifest } from "@assetpack/plugin-manifest";
import { path, SavableAssetCache } from "@assetpack/core";

const SPRITESHEET_PARSER = "Aseprite_spritesheet_Parser";
const TILESET_PARSER = "Aseprite_tileset_Parser";

const loadParserByAssetType = {
  tilesets: TILESET_PARSER,
  skills: SPRITESHEET_PARSER,
  units: SPRITESHEET_PARSER,
  tiles: SPRITESHEET_PARSER,
  ui: SPRITESHEET_PARSER,
  interactables: SPRITESHEET_PARSER,
  fx: SPRITESHEET_PARSER,
  modifiers: SPRITESHEET_PARSER,
};

function manifestEntryParser(tree, processor) {
  const transformData = SavableAssetCache.get(tree.path).transformData;

  const res = transformData.files.map((file) => {
    const name = processor.trimOutputPath(file.name ?? file.paths[0]);

    const assetType = name.split("/")[0];
    const loadParser = loadParserByAssetType[assetType];

    const assetName = name.split("/").at(-1);
    const res = {
      alias: name.endsWith(".json") ? path.trimExt(assetName) : assetName,
      src: file.paths.map(
        (path) => `/assets/${processor.trimOutputPath(path)}`
      ),
      loadParser: name.endsWith(".json") ? loadParser : undefined,
    };

    file.data && (res.data = file.data);

    return res;
  });

  return res;
}

export default function (entry, output) {
  return {
    entry,
    output,
    ignore: ["**/*.ts", "**/*.aseprite"],
    cache: false,
    plugins: {
      compressPng: compressPng(),
      audio: audio(),
      json: json(),
      manifest: pixiManifest({
        output: `${output}/assets-manifest.json`,
        trimExtensions: false,
        parsers: [{ type: "copy", parser: manifestEntryParser }],
      }),
    },
  };
}
