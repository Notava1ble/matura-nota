export type DatasetIndex = {
  latestYear: number;
  years: number[];
  source: string;
  updatedAt: string;
};

export type Percentiles = {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
};

export type Summary = {
  year: number;
  exam: string;
  candidateCount: number;
  resultCount: number;
  averageGrade: number;
  medianGrade: number;
  passRate: number;
  averagePoints: number;
  percentiles: Percentiles;
  gradeDistribution: Array<{ grade: string; count: number }>;
  scoreDistribution: Array<{ range: string; count: number }>;
  insights: string[];
};

export type SubjectMetric = {
  subject: string;
  exam: string;
  candidateCount: number;
  averagePoints: number;
  averageGrade: number;
  medianGrade: number;
  passRate: number;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  topGradeShare: number;
  trend: number;
};

export type StudentResult = {
  subject: string;
  exam: string;
  totalPoints: number;
  scaledGrade: number;
  grade: number;
  nationalAverage: number;
  percentile: number;
};

export type StudentRecord = {
  id: string;
  results: StudentResult[];
};
