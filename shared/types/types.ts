export type ExtractedType = {
  ID: string;
  Lënda: string;
  "Pikë Totale": number;
  "Nota e Shkallëzuar": number;
  Nota: number;
};

export type FormatedData = {
  id: string;
  subject: string;
  points: number;
  roundedGrade: number;
  grade: number;
};
export type ExamData = FormatedData & { examTitle: string };

export type OverviewData = {
  examTitle: string;
  numberOfStudents: number;
  gradeAverage: number;
  pointsAverage: number;
  pointDistribution: number[];
  pointBuckets: PointBucket[];
  // medianPoints: number;
  // medianGrade: number;
  // stdDevGrade: number;
  // stdDevPoints: number;
  // passRate: number;
};

export type StudentStatsFile = {
  [x: string]: StudentStats;
};

export type StudentStats = {
  averagePoints: number;
  averageGrade: number;
  roundedAverageGrade: number;
  roundedAveragePoints: number;
  totalPoints: number;
  bestExam?: string;
  worstExam?: string;
  passedExamsCount: number;
  failedExamsCount: number;
  // stdDev: number;
  // overallRank: number;
  // overallPercentile: number;
  exams: StudentExamStats[];
};

export type StudentExamStats = {
  examTitle: string;
  subject: string;
  grade: number;
  roundedGrade: number;
  points: number;
  passed: boolean;
  rank: number;
  percentile: number;
};

export type PointBucket = {
  from: number;
  to: number;
  count: number;
};
