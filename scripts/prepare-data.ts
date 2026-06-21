import {
  ExamData,
  ExtractedType,
  FormatedData,
  OverviewData,
  StudentExamStats,
  StudentStats,
} from "@shared/types/types";
import {
  converToProperObject,
  folderContents,
  formatSubject,
  readFile,
  writeFile,
  writeStudentToFile,
} from "@shared/utils/utils";
import {
  getAverage,
  createPointDistribution,
  fillBuckets,
  sum,
  standardDeviation,
  getRank,
  getPercentile,
  minMax,
} from "@shared/utils/statistics";
import { join } from "path";
import { POINT_BUCKETS } from "@shared/consts";

const INPUT_FOLDER = "./scripts/extraction/data/out";
const OUTPUT_FOLDER = "./public/data";
const PREFIX = 7;

const PASSING_SCORE = 15;

async function main() {
  const subjects = await folderContents(INPUT_FOLDER);
  const studentMap = new Map<string, ExamData[]>();
  let pointDistribution: { examTitle: string; distribution: number[] }[] = [];

  // Subject Overview
  const subjectOverview: OverviewData[] = [];
  for (const subject of subjects) {
    console.log(`Reading ${subject}`);

    const data = (await readFile(
      join(INPUT_FOLDER, subject),
    )) as ExtractedType[];

    console.log(`Done reading ${subject}, with ${data.length} records.`);

    const formatedData = converToProperObject(data);
    const overview = prepareSubjectData(formatedData);
    console.log(`Created overview.`);

    const examTitle = formatSubject(subject);
    pointDistribution.push({
      examTitle,
      distribution: overview.pointDistribution,
    });

    console.log(`Formated exam title to ${examTitle}`);
    subjectOverview.push({
      examTitle,
      ...overview,
    });

    for (const data of formatedData) {
      const existing = studentMap.get(data.id) ?? [];
      studentMap.set(data.id, [...existing, { ...data, examTitle }]);
    }
  }

  await writeFile(subjectOverview, join(OUTPUT_FOLDER, "overview.json"));

  // Student Overview
  for (const [student, exams] of studentMap) {
    const individualRecords = computeIndividualStats(
      student,
      exams,
      pointDistribution,
    );
    await writeStudentToFile(
      student,
      individualRecords,
      join(OUTPUT_FOLDER, "students"),
      PREFIX,
    );
  }
}

function prepareSubjectData(formatedData: FormatedData[]) {
  // Overview
  const numberOfStudents = formatedData.length;
  const gradeAverage = getAverage(formatedData.map((s) => s.grade));
  const pointsAverage = getAverage(formatedData.map((s) => s.points));

  // point distribution
  const pointDistribution = createPointDistribution(
    formatedData.map((s) => s.points),
    61,
  );
  const pointBuckets = fillBuckets(pointDistribution, POINT_BUCKETS);

  return {
    numberOfStudents,
    gradeAverage,
    pointsAverage,
    pointDistribution,
    pointBuckets,
  };
}

function computeIndividualStats(
  student: string,
  exams: ExamData[],
  pointDistribution: { examTitle: string; distribution: number[] }[],
): StudentStats {
  const points = exams.map((exam) => exam.points);

  const averagePoints = getAverage(points);
  const averageGrade = getAverage(exams.map((exam) => exam.grade));
  const roundedAveragePoints = Math.round(averagePoints);
  const roundedAverageGrade = Math.round(averageGrade);
  const totalPoints = sum(points);
  const { min: worstExam, max: bestExam } = minMax(
    exams,
    (item) => item.points,
  );

  const passedExams = exams.filter((e) => e.points >= PASSING_SCORE);
  const passedExamsCount = passedExams.length;
  const failedExamsCount = exams.length - passedExams.length;

  // const stdDev = standardDeviation(points);

  const perExamStats: StudentExamStats[] = [];

  for (const exam of exams) {
    const overallDistribution = pointDistribution.find(
      (dist) => (dist.examTitle = exam.examTitle),
    );

    perExamStats.push({
      examTitle: exam.examTitle,
      subject: exam.subject,
      grade: exam.grade,
      roundedGrade: exam.roundedGrade,
      points: exam.points,
      passed: exam.points >= PASSING_SCORE,
      rank: getRank(exam.points, overallDistribution?.distribution),
      percentile: getPercentile(exam.points, overallDistribution?.distribution),
    });
  }

  return {
    averagePoints,
    averageGrade,
    roundedAverageGrade,
    roundedAveragePoints,
    totalPoints,
    bestExam: bestExam?.examTitle,
    worstExam: worstExam?.examTitle,
    passedExamsCount,
    failedExamsCount,
    // stdDev,
    exams: perExamStats,
  };
}

main();
