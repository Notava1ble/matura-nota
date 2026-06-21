import {
  StudentStats,
  StudentStatsFile,
  type OverviewData,
} from "@shared/types/types";

export async function loadOverview(): Promise<OverviewData[]> {
  const response = await fetch(`/data/overview.json`);
  return readJson<OverviewData[]>(response);
}

export async function loadStudent(studentId: string): Promise<StudentStats> {
  const response = await fetch(`/data/students${studentId.slice(0, 7)}.json`);
  const file = await readJson<StudentStatsFile>(response);
  return file[studentId];
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Data request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
