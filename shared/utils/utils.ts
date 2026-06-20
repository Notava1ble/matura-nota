import { ExtractedType, FormatedData } from "@shared/types/types";
import { readdir } from "fs/promises";

export async function readFile(path: string) {
  return await Bun.file(path).json();
}

export async function folderContents(path: string) {
  return await readdir(path);
}

export function converToProperObject(data: ExtractedType[]): FormatedData[] {
  return data.map((d) => ({
    id: d.ID,
    subject: d.Lënda,
    points: d["Pikë Totale"],
    roundedGrade: d.Nota,
    grade: d["Nota e Shkallëzuar"],
  }));
}
