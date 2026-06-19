import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

type RawRecord = Record<string, unknown>;

type CleanRecord = {
  id: string;
  subject: string;
  totalPoints: number;
  scaledGrade: number;
  grade: number;
};

type Percentiles = {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
};

type StudentResult = {
  subject: string;
  exam: string;
  totalPoints: number;
  scaledGrade: number;
  grade: number;
  nationalAverage: number;
  percentile: number;
};

type StudentRecord = {
  id: string;
  results: StudentResult[];
};

const defaultInput = "scripts/extraction/data/rezultatet_streamed.json";
const defaultOutput = "public/data";

const options = parseArgs(process.argv.slice(2));
const inputPath = resolve(options.input ?? defaultInput);
const outputDir = resolve(options.output ?? defaultOutput);
const year = Number(options.year ?? "2025");
const exam = options.exam ?? "D1";
const source = options.source ?? "Publikimi i Rezultateve D1";

if (!Number.isInteger(year)) {
  throw new Error(`Invalid year: ${options.year}`);
}

const raw = JSON.parse(await readFile(inputPath, "utf8")) as RawRecord[];
const records = raw.map(cleanRecord).filter((record): record is CleanRecord => record !== null);

if (records.length === 0) {
  throw new Error(`No usable records found in ${inputPath}`);
}

records.sort((a, b) => a.id.localeCompare(b.id) || a.subject.localeCompare(b.subject));

const yearDir = join(outputDir, String(year));
await rm(outputDir, { recursive: true, force: true });
await mkdir(join(yearDir, "students"), { recursive: true });

const subjects = buildSubjectMetrics(records);
const subjectAverages = new Map(subjects.map((subject) => [subject.subject, subject.averagePoints]));
const subjectPointSets = new Map<string, number[]>();

for (const record of records) {
  const scores = subjectPointSets.get(record.subject) ?? [];
  scores.push(record.totalPoints);
  subjectPointSets.set(record.subject, scores);
}

for (const scores of subjectPointSets.values()) {
  scores.sort((a, b) => a - b);
}

const students = buildStudentRecords(records, subjectAverages, subjectPointSets);
const summary = buildSummary(records, year);

await writeJson(join(outputDir, "index.json"), {
  latestYear: year,
  years: [year],
  source,
  updatedAt: new Date().toISOString(),
});
await writeJson(join(yearDir, "summary.json"), summary);
await writeJson(join(yearDir, "subjects.json"), subjects);

for (const [shard, shardRecords] of shardStudents(students)) {
  await writeJson(join(yearDir, "students", `${shard}.json`), shardRecords);
}

console.log(`Prepared ${records.length} results for ${students.length} students in ${outputDir}`);

function cleanRecord(record: RawRecord): CleanRecord | null {
  const id = String(readField(record, ["ID", "id"]) ?? "").trim();
  const subject = normalizeText(String(readField(record, ["Lënda", "LÃ«nda", "Lenda", "subject"]) ?? ""));
  const totalPoints = toNumber(readField(record, ["Pikë Totale", "PikÃ« Totale", "Pike Totale", "totalPoints"]));
  const scaledGrade = toNumber(
    readField(record, ["Nota e Shkallëzuar", "Nota e ShkallÃ«zuar", "Nota e Shkallezuar", "scaledGrade"]),
  );
  const grade = toNumber(readField(record, ["Nota", "grade"]));

  if (!id || !subject || totalPoints === null || scaledGrade === null || grade === null) {
    return null;
  }

  return { id, subject, totalPoints, scaledGrade, grade };
}

function readField(record: RawRecord, keys: string[]): unknown {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      return record[key];
    }
  }

  return undefined;
}

function normalizeText(value: string): string {
  const repaired = value
    .replaceAll("Ã‹", "Ë")
    .replaceAll("Ã«", "ë")
    .replaceAll("Ã‡", "Ç")
    .replaceAll("Ã§", "ç");
  return repaired.replace(/\s+/g, " ").trim();
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function buildSummary(records: CleanRecord[], summaryYear: number) {
  const grades = records.map((record) => record.grade).sort((a, b) => a - b);
  const points = records.map((record) => record.totalPoints).sort((a, b) => a - b);
  const uniqueStudents = new Set(records.map((record) => record.id));
  const subjectCount = new Set(records.map((record) => record.subject)).size;
  const passRate = percentage(records.filter((record) => record.grade >= 5).length, records.length);

  return {
    year: summaryYear,
    exam: "Matura Shteterore",
    candidateCount: uniqueStudents.size,
    resultCount: records.length,
    averageGrade: round(average(grades)),
    medianGrade: round(percentile(grades, 50)),
    passRate,
    averagePoints: round(average(points)),
    percentiles: {
      p10: round(percentile(points, 10)),
      p25: round(percentile(points, 25)),
      p50: round(percentile(points, 50)),
      p75: round(percentile(points, 75)),
      p90: round(percentile(points, 90)),
    } satisfies Percentiles,
    gradeDistribution: buildGradeDistribution(records),
    scoreDistribution: buildScoreDistribution(points),
    insights: [
      `Te dhenat perfshijne ${records.length} rezultate nga ${uniqueStudents.size} kandidate.`,
      `Nota mesatare kombetare eshte ${round(average(grades))}, me kalueshmeri ${passRate}%.`,
      `Raporti perfshin ${subjectCount} lende te nxjerra nga publikimi zyrtar.`,
    ],
  };
}

function buildSubjectMetrics(records: CleanRecord[]) {
  const bySubject = groupBy(records, (record) => record.subject);

  return [...bySubject.entries()]
    .map(([subject, subjectRecords]) => {
      const points = subjectRecords.map((record) => record.totalPoints).sort((a, b) => a - b);
      const grades = subjectRecords.map((record) => record.grade).sort((a, b) => a - b);
      const uniqueStudents = new Set(subjectRecords.map((record) => record.id));

      return {
        subject,
        exam,
        candidateCount: uniqueStudents.size,
        averagePoints: round(average(points)),
        averageGrade: round(average(grades)),
        medianGrade: round(percentile(grades, 50)),
        passRate: percentage(subjectRecords.filter((record) => record.grade >= 5).length, subjectRecords.length),
        percentile25: round(percentile(points, 25)),
        percentile50: round(percentile(points, 50)),
        percentile75: round(percentile(points, 75)),
        topGradeShare: percentage(subjectRecords.filter((record) => record.grade >= 10).length, subjectRecords.length),
        trend: 0,
      };
    })
    .sort((a, b) => a.subject.localeCompare(b.subject));
}

function buildStudentRecords(
  records: CleanRecord[],
  subjectAverages: Map<string, number>,
  subjectPointSets: Map<string, number[]>,
): StudentRecord[] {
  const byStudent = groupBy(records, (record) => record.id);

  return [...byStudent.entries()]
    .map(([id, studentRecords]) => ({
      id,
      results: studentRecords
        .map((record) => ({
          subject: record.subject,
          exam,
          totalPoints: record.totalPoints,
          scaledGrade: record.scaledGrade,
          grade: record.grade,
          nationalAverage: subjectAverages.get(record.subject) ?? 0,
          percentile: percentileRank(subjectPointSets.get(record.subject) ?? [], record.totalPoints),
        }))
        .sort((a, b) => a.subject.localeCompare(b.subject)),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function buildGradeDistribution(records: CleanRecord[]) {
  const counts = new Map<number, number>();
  for (const record of records) {
    counts.set(record.grade, (counts.get(record.grade) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([a], [b]) => a - b)
    .map(([grade, count]) => ({ grade: String(grade), count }));
}

function buildScoreDistribution(points: number[]) {
  const max = Math.max(...points);
  const upper = Math.max(10, Math.ceil(max / 10) * 10);
  const buckets: Array<{ range: string; count: number; min: number; max: number }> = [];

  for (let min = 0; min < upper; min += 10) {
    buckets.push({ range: `${min}-${min + 9}`, count: 0, min, max: min + 9 });
  }

  for (const point of points) {
    const bucket = buckets.find((candidate) => point >= candidate.min && point <= candidate.max) ?? buckets.at(-1);
    if (bucket) {
      bucket.count += 1;
    }
  }

  return buckets.map(({ range, count }) => ({ range, count }));
}

function shardStudents(students: StudentRecord[]) {
  const shards = groupBy(students, (student) => student.id[0]?.toLowerCase() ?? "_");
  return [...shards.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function groupBy<T>(items: T[], keyFor: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = keyFor(item);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  return groups;
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(sortedValues: number[], rank: number): number {
  if (sortedValues.length === 1) {
    return sortedValues[0];
  }

  const index = (rank / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

function percentileRank(sortedValues: number[], value: number): number {
  if (sortedValues.length === 0) {
    return 0;
  }

  let count = 0;
  for (const candidate of sortedValues) {
    if (candidate <= value) {
      count += 1;
    } else {
      break;
    }
  }

  return round((count / sortedValues.length) * 100);
}

function percentage(count: number, total: number): number {
  return round((count / total) * 100);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function parseArgs(args: string[]): Record<string, string> {
  const parsed: Record<string, string> = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      continue;
    }

    const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
    parsed[rawKey] = inlineValue ?? args[index + 1] ?? "";
    if (inlineValue === undefined) {
      index += 1;
    }
  }

  return parsed;
}
