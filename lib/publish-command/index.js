const fs = require("fs");
const path = require("path");
const selectCheckpoint = require("../select-checkpoint");
const saveAssessment = require("./save-assessment");
const saveChallengeItem = require("./save-challenge-item");
const assessmentConfigureCommand = require("../assessment-configure-command");
const fetchAssessment = require("../fetch-assessment");
const saveChallenges = require("./save-challenges");

const debug = require("../debug")(__dirname, __filename);

const command = "publish";
const describe =
  "Prompts for a module and then checkpoint, then publishes the checkpoint's `qualified` folder to a challenge. If there are existing assessment.json and challenge.json files in the checkpoint folder, the challenge is updated, otherwise a new assessment and challenge are created.";

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
    .option("n", {
      alias: "multiple-challenges",
      demandOption: false,
      type: "boolean",
      describe: "indicates the qualified folder contains multiple challenges",
    });
}

async function handler(config) {
  const checkpoint = config["checkpoint-folder"]
    ? config["checkpoint-folder"]
    : await selectCheckpoint(config.webDevPath);

  config["checkpoint-folder"] = checkpoint;

  const checkpointFolder = path.join(config.webDevPath, "library", checkpoint);
  const qualifiedFolder = path.join(checkpointFolder, "qualified");

  if (!fs.existsSync(qualifiedFolder)) {
    throw new Error(`Qualified folder not found: ${qualifiedFolder}`);
  }

  // Update the permissions file with current contents.
  const authorooJson = await assessmentConfigureCommand.handler(config);

  debug("authorooJson", authorooJson);

  try {
    const challenges = await saveChallenges(
      config.qualifiedApiKey,
      checkpoint,
      checkpointFolder,
      authorooJson
    );

    const savedAssessment = await saveAssessment(
      checkpoint,
      checkpointFolder,
      authorooJson.title || challenges[0].title,
      authorooJson.labels || challenges[0].labels,
      config.qualifiedApiKey
    );

    await Promise.all(
      challenges.map((challenge) => {
        saveChallengeItem(
          checkpointFolder,
          savedAssessment.data.id,
          challenge.data.id,
          checkpoint,
          config.qualifiedApiKey
        );
      })
    );

    const updatedAssessment = await fetchAssessment(
      config.qualifiedApiKey,
      savedAssessment.data.id
    );

    const assessmentFile = path.join(checkpointFolder, "assessment.json");
    fs.writeFileSync(
      assessmentFile,
      JSON.stringify(updatedAssessment, null, 4)
    );

    console.log("Done");
    console.log("Commit any new or updated .json files to the repository.");
    console.log(
      "Also visit the assessment link below to publish the assessment."
    );

    challenges.forEach((savedChallenge) => {
      console.log(
        `https://www.qualified.io/hire/challenges/${savedChallenge.data.id}`
      );
    });

    console.log(
      `https://www.qualified.io/hire/assessments/${savedAssessment.data.id}`
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = {
  command,
  describe,
  builder,
  handler,
  aliases: ["assessment"],
};
