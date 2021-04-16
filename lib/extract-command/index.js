const fs = require("fs");
const inquirer = require("inquirer");
const path = require("path");

const selectCheckpoint = require("../select-checkpoint");
const writeAssessmentAndChallenge = require("../write-assessment-and-challenge");
const extractChallenge = require("../extract-challenge");

const debug = require("../debug")(__dirname, __filename);

const questions = [
  {
    type: "input",
    name: "assessmentId",
    message: "What is the assessment id?",
  },
];

const command = "extract";
const describe =
  "Prompts for a module and checkpoint, then extracts the files from the qualified challenge into the checkpoint's `qualified` folder, overwriting any existing files. If there is an existing assessment.json file in the checkpoint, this command will use the assessmentId from the existing assessment.json file, otherwise it will prompt for the assessmentId. No files are deleted.";

function builder(yargs) {
  return yargs
    .config()
    .option("q", {
      alias: "qualifiedApiKey",
      demandOption: true,
      describe:
        "Qualified API access key copied from https://www.qualified.io/hire/account/integrations#api-key.",
      nargs: 1,
      type: "string",
    })
    .option("c", {
      alias: "checkpoint-folder",
      demandOption: false,
      type: "string",
      describe:
        "the path of the checkpoint folder inside of library (omit `./library` i.e. `<checkpoint-folder-name>`",
    })
    .option("a", {
      alias: "assessment-id",
      demandOption: false,
      type: "string",
      describe: "the id of the assessment",
    })
    .option("p", {
      alias: "docker-port",
      demandOption: false,
      type: "number",
      describe: "the port exposed by docker",
    });
}

async function handler(config) {
  const checkpoint =
    config["checkpoint-folder"] || (await selectCheckpoint(config.webDevPath));

  const moreQuestions = [
    {
      type: "number",
      name: "port",
      default: 3000,
      message:
        "Which port should the Dockerfile expose (Usually 3000 for React, 5000 for node, and 8080 for Spring boot)",
    },
  ];

  const answers = config["docker-port"]
    ? { port: config["docker-port"] }
    : await inquirer.prompt(moreQuestions);

  const checkpointFolder = path.join(config.webDevPath, "library", checkpoint);
  const qualifiedFolder = path.join(checkpointFolder, "qualified");
  const authorooFile = path.join(checkpointFolder, "authoroo.json");
  const assessmentFile = path.join(checkpointFolder, "assessment.json");

  const assessmentExists = fs.existsSync(assessmentFile);

  if (assessmentExists) {
    console.log(
      `Extracting assessment id from existing assessment.json: ${assessmentFile}`
    );
  }

  const assessmentId = assessmentExists
    ? require(assessmentFile).data.id
    : config["assessment-id"] ||
      (await inquirer
        .prompt(questions)
        .then((answers) => answers.assessmentId));

  const challenges = await writeAssessmentAndChallenge(
    assessmentId,
    checkpointFolder,
    config.qualifiedApiKey,
    checkpoint,
    answers.port
  );

  debug("challenges from writeAssessmentAndChallenge", challenges);

  if (Array.isArray(challenges)) {
    const authorooJson = JSON.parse(fs.readFileSync(authorooFile).toString());

    debug("authorooJson", authorooJson)

    await Promise.all(
      challenges.map(async (challenge) => {
        const challengeConfig = authorooJson.challenges.find(
          (authorooJsonChallenge) =>
            authorooJsonChallenge.id === challenge.data.id
        );

        if (challengeConfig) {
          debug("challengeConfig", challengeConfig);

          await extractChallenge(
            checkpoint,
            challenge,
            qualifiedFolder,
            `${checkpoint}-${challengeConfig.folder}`,
            challengeConfig.port,
            challengeConfig.folder
          );

          challenge.data.files?.sort(byPath);
          challengeConfig.files = challenge.data.files?.map((file) => ({
            path: file.path,
            access: file.access,
          }));

          fs.writeFileSync(authorooFile, JSON.stringify(authorooJson, null, 4));
        } else {
          throw new Error(
            `authoroo.json does not contain configuration for challenge: ${challenge.data.id}`
          );
        }
      })
    );
  } else {
    await extractChallenge(
      checkpoint,
      challenges,
      qualifiedFolder,
      checkpoint,
      answers.port,
      ""
    );
  }

  console.log("Done");
}

function byPath(leftFile, rightFile) {
  return leftFile.path.localeCompare(rightFile.path);
}

module.exports = {
  command,
  describe,
  builder,
  handler,
};
