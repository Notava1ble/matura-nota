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

// export type OverviewData = {
//   subject: string;
//   numberOfStudents: number;
//   gradeAverage: number;
//   pointsAverage: number;
//   pointDistribution: number;
//   pointBuckets: number;
// };

export type PointBucket = {
  from: number;
  to: number;
  count: number;
};
