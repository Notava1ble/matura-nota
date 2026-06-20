import { ExtractedType, FormatedData } from "@shared/types/types";
import { readdir } from "fs/promises";

export async function readFile(path: string) {
  return await Bun.file(path).json();
}

export async function folderContents(path: string) {
  return await readdir(path);
}

export async function writeFile(data: any, path: string) {
  await Bun.write(path, JSON.stringify(data, null, 2));
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

export function formatSubject(subject: string): string {
  return subject
    .replace(/\.json$/i, "")
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
