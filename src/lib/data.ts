import type { DatasetIndex, StudentRecord, SubjectMetric, Summary } from "../types/data";

export async function loadDatasetIndex(): Promise<DatasetIndex> {
  const response = await fetch("/data/index.json");
  return readJson<DatasetIndex>(response);
}

export async function loadSummary(year: number): Promise<Summary> {
  const response = await fetch(`/data/${year}/summary.json`);
  return readJson<Summary>(response);
}

export async function loadSubjects(year: number): Promise<SubjectMetric[]> {
  const response = await fetch(`/data/${year}/subjects.json`);
  return readJson<SubjectMetric[]>(response);
}

export async function lookupStudent(year: number, id: string): Promise<StudentRecord | null> {
  const normalizedId = id.trim().toUpperCase();
  if (!normalizedId) {
    return null;
  }

  const shard = normalizedId[0].toLowerCase();
  const response = await fetch(`/data/${year}/students/${shard}.json`);
  if (response.status === 404) {
    return null;
  }

  const records = await readJson<StudentRecord[]>(response);
  return records.find((record) => record.id.toUpperCase() === normalizedId) ?? null;
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Data request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
