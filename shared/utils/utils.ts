import {
  ExtractedType,
  FormatedData,
  StudentStats,
  StudentStatsFile,
} from "@shared/types/types";
import { readdir } from "fs/promises";
import { join } from "path";

export async function readFile(path: string) {
  const file = Bun.file(path);

  if (await file.exists()) return await file.json();

  return null;
}

export async function folderContents(path: string) {
  return await readdir(path);
}

export async function writeFile(data: any, path: string) {
  await Bun.write(path, JSON.stringify(data, null, 2));
}

export async function writeStudentToFile(
  studentId: string,
  data: StudentStats,
  folder: string,
  PREFIX = 7,
) {
  const prefix = studentId.slice(0, PREFIX);
  const path = join(folder, `${prefix}.json`);

  const file = (await readFile(path)) as StudentStatsFile | null;

  if (!file) {
    const preparedData = { [studentId as string]: data };
    await writeFile(preparedData, path);
    return;
  }

  file[studentId] = data;
  await writeFile(file, path);
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

export { formatSubject } from "./format";
