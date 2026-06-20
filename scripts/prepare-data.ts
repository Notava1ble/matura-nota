import { ExtractedType } from "@shared/types/types";
import {
  converToProperObject,
  folderContents,
  formatSubject,
  readFile,
  writeFile,
} from "@shared/utils/utils";
import {
  getAverage,
  createPointDistribution,
  fillBuckets,
} from "@shared/utils/statistics";
import { join } from "path";
import { POINT_BUCKETS } from "@shared/consts";

const INPUT_FOLDER = "./scripts/extraction/data/out";
const OUTPUT_FOLDER = "./public/data";

async function main() {
  const subjects = await folderContents(INPUT_FOLDER);

  const final = [];
  for (const subject of subjects) {
    console.log(`Reading ${subject}`);

    const data = (await readFile(
      join(INPUT_FOLDER, subject),
    )) as ExtractedType[];

    console.log(`Done reading ${subject}, with ${data.length} records.`);

    const overview = prepareSubjectData(data);

    console.log(`Created overview.`);

    const examTitle = formatSubject(subject);
    console.log(`Formated exam title to ${examTitle}`);
    final.push({
      examTitle,
      ...overview,
    });
  }

  await writeFile(final, join(OUTPUT_FOLDER, "overview.json"));
}

function prepareSubjectData(extractedData: ExtractedType[]) {
  const formatedData = converToProperObject(extractedData);

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

main();
