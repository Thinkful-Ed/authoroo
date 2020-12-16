const fs = require("fs");

const inquirer = require("inquirer");
const path = require("path");
const selectCheckpoint = require("../select-checkpoint");
const writeAssessmentAndChallenge = require("../write-assessment-and-challenge");
const writeDockerFiles = require("../write-docker-files");

const debug = require("debug")("authoroo:extract");

const questions = [
  {
    type: "input",
    name: "assessmentId",
    message: "What is the assessment id?",
  },
];

const command = "extract";
const describe =
  "Prompts for zid module and checkpoint, then extracts the files from the qualified challenge into the checkpoint directory.";

function builder(yargs) {
  return yargs.config().option("q", {
    alias: "qualifiedApiKey",
    demandOption: true,
    describe:
      "Qualified API access key copied from https://www.qualified.io/hire/account/integrations#api-key.",
    nargs: 1,
    type: "string",
  });
}

async function handler(config) {
  const checkpoint = await selectCheckpoint(config.webDevPath);

  const checkpointFolder = path.join(config.webDevPath, "library", checkpoint);
  const qualifiedFolder = path.join(checkpointFolder, "qualified");
  const solutionFolder = path.join(qualifiedFolder, "solution");

  const assessmentFile = path.join(checkpointFolder, "assessment.json");

  const assessmentExists = fs.existsSync(assessmentFile);

  if (assessmentExists) {
    console.log(
      `Extracting assessment id from existing assessment.json: ${assessmentFile}`
    );
  }

  const assessmentId = assessmentExists
    ? require(assessmentFile).data.id
    : await inquirer.prompt(questions).then((answers) => answers.assessmentId);

  const challenge = await writeAssessmentAndChallenge(
    assessmentId,
    checkpointFolder,
    config.qualifiedApiKey
  );

  (challenge.data.files || [])
    .filter((file) => !file.directory)
    .forEach(writeFile(qualifiedFolder, config));

  (challenge.data.referenceFiles || [])
    .filter((file) => !file.directory)
    .forEach(writeFile(solutionFolder, config));

  if (!fs.existsSync(qualifiedFolder)) {
    fs.mkdirSync(qualifiedFolder, { recursive: true });
  }

  fs.writeFileSync(
    path.join(qualifiedFolder, "README.md"),
    challenge.data.instructions
  );

  const moreQuestions = [
    {
      type: "number",
      name: "port",
      default: 3000,
      message:
        "Which port should the Dockerfile expose (Usually 3000 for React, 5000 for node, and 8080 for Spring boot)",
    },
  ];

  const answers = await inquirer.prompt(moreQuestions);

  await writeDockerFiles(qualifiedFolder, { ...answers, checkpoint });

  console.log("Done");
}

function writeFile(destinationFolder, config) {
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

module.exports = {
  command,
  describe,
  builder,
  handler,
};
