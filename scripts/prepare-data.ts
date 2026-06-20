import { ExtractedType } from "@shared/types/types";
import {
  converToProperObject,
  folderContents,
  readFile,
} from "@shared/utils/utils";
import { getAverage } from "@shared/utils/statistics";
import { join } from "path";

const INPUT_FOLDER = "./extraction/data/out";

async function main() {
  const subjects = await folderContents(INPUT_FOLDER);
  for (const subject in subjects) {
    console.log(`Reading ${subject}`);

    const data = (await readFile(
      join(INPUT_FOLDER, subject),
    )) as ExtractedType[];
    prepareSubjectData(data);
  }
}

function prepareSubjectData(extractedData: ExtractedType[]) {
  const frmatedData = converToProperObject(extractedData);

  const numberOfStudents = frmatedData.length;
  const gradeAverage = getAverage(frmatedData.map((s) => s.grade));
  const pointsAverage = getAverage(frmatedData.map((s) => s.grade));
}

main();
