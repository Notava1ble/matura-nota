import { ExtractedType } from "@shared/types/types";
import { folderContents, getAvarage, readFile } from "@shared/utils/utils";
import { join } from "path";

const INPUT_FOLDER = "./extraction/data/out";

async function main() {
  const subjects = await folderContents(INPUT_FOLDER);
  for (const subject in subjects) {
    console.log(`Reading ${subject}`);

    const data = (await readFile(join(INPUT_FOLDER, subject))) as ExtractedType;
    prepareSubjectData(data);
  }
}

function prepareSubjectData(extractedData: ExtractedType) {
  const numberOfStudents = extractedData.length;
  const avarage = getAvarage(extractedData.map((s) => s["Nota e Shkallëzuar"]));
}

main();
