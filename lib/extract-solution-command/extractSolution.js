const fs = require("fs");
const path = require("path");
const writeDockerFiles = require("../write-docker-files");
const writeFile = require("../write-file");

const debug = require("../debug")(__dirname, __filename);

async function extractSolution(solution, destinationFolder, port) {
  debug(solution, destinationFolder, port);

  const targetFolder = path.join(
    destinationFolder,
    "thinkful-ed",
    "solutions",
    solution.data.id
  );

  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  solution.data.files
    ?.filter((file) => !file.directory)
    .filter((file) => !file.path.endsWith(".DS_Store"))
    .forEach(writeFile(targetFolder));

  const context = { port, checkpoint: solution.data.id };

  await writeDockerFiles(targetFolder, context);

  const packageJsonContents = solution.data.files?.find(
    (file) => file.path === "package.json"
  )?.contents;

  if (packageJsonContents) {
    const contents = packageJsonContents
      .replace(
        / thinkful-ed\/.* npm test"/,
        ` thinkful-ed/solution-${solution.data.id} npm test"`
      )
      .replace(
        / thinkful-ed\/.*"/g,
        ` thinkful-ed/solution-${solution.data.id}"`
      );

    const packageJsonFile = path.join(targetFolder, "package.json");

    fs.writeFileSync(packageJsonFile, contents);
  }

  fs.writeFileSync(
    path.join(targetFolder, "solution.json"),
    JSON.stringify(solution, null, 4)
  );

  return Promise.resolve(targetFolder);
}

module.exports = extractSolution;
