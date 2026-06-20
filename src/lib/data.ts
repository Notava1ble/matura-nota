import { type OverviewData } from "@shared/types/types";

export async function loadSummary(): Promise<OverviewData> {
  const response = await fetch(`/data/overview.json`);
  return readJson<OverviewData>(response);
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Data request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
