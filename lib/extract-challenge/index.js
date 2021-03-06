const fs = require("fs");
const Handlebars = require("handlebars");
const path = require("path");
const writeDockerFiles = require("../write-docker-files");

const debug = require("../debug")(__dirname, __filename);

const packageJson = require("../package");

async function extractChallenge(
  checkpoint,
  challenge,
  qualifiedFolder,
  packageName,
  port,
  challengeFolder
) {
  debug(
    checkpoint,
    challenge,
    qualifiedFolder,
    packageName,
    port,
    challengeFolder
  );

  const targetFolder = path.join(qualifiedFolder, challengeFolder);
  const solutionFolder = path.join(targetFolder, "solution");

  if (!fs.existsSync(solutionFolder)) {
    fs.mkdirSync(solutionFolder, { recursive: true });
  }

  challenge.data.files
    ?.filter((file) => !file.directory)
    .forEach(writeFile(targetFolder));

  challenge.data.referenceFiles
    ?.filter((file) => !file.directory)
    .forEach(writeFile(solutionFolder));

  fs.writeFileSync(
    path.join(targetFolder, "README.md"),
    challenge.data.instructions
  );

  const context = { port, checkpoint: packageName.toLowerCase() };

  await writeDockerFiles(targetFolder, context);

  const packageJsonFile = path.join(targetFolder, "package.json");

  if (fs.existsSync(packageJsonFile) === false) {
    debug("packageJsonFile does not exist", packageJsonFile);

    const packageJsonTemplate = Handlebars.compile(packageJson);
    const contents = packageJsonTemplate(context);
    fs.writeFileSync(packageJsonFile, contents);
  }
}

function writeFile(destinationFolder) {
  return (file) => {
    const filePath = path.join(destinationFolder, file.path);
    const folder = path.dirname(filePath);

    debug("reference file", file.path, folder, filePath);

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    fs.writeFileSync(filePath, file.contents);
  };
}

module.exports = extractChallenge;
