import { ExtractedType } from "@shared/types/types";
import { readFile } from "@shared/utils/utils";
import { join } from "path";

const INPUT_FOLDER = "./scripts/extraction/data/out";

const file = (await readFile(
  join(INPUT_FOLDER, "letersi.json"),
)) as ExtractedType[];

console.log(
  uniquePrefixes(
    file.map((entry) => entry.ID),
    7,
  ),
);

export function uniquePrefixes(ids: string[], len: number) {
  const prefixMap = new Map<string, number>();
  for (const id of ids) {
    const prefix = id.slice(0, len);
    const existing = prefixMap.get(prefix);
    prefixMap.set(prefix, (existing ?? 0) + 1);
  }

  return prefixMap;
}
