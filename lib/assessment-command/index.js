const path = require("path");
const selectCheckpoint = require("../select-checkpoint");
const selectModule = require("../select-module");
const saveChallenge = require("./saveChallenge");
const saveAssessment = require("./saveAssessment");
const challengeOptions = require("../challenge-options");

const command = "assessment";
const describe =
  "Prompts for zid module then checkpoint to automatically create or update the qualified assessment.";

function builder(yargs) {
  return yargs
    .config({
      extends: "./.authoroo.json",
    })
    .option("q", {
      alias: "qualifiedApiKey",
      demandOption: true,
      describe:
        "Qualified API access key copied from https://www.qualified.io/hire/account/integrations#api-key.",
      nargs: 1,
      type: "string",
    })
    .option("e", {
      alias: "estimatedTime",
      requiresArg: true,
      describe: "The estimated time to complete the assessment",
      nargs: 1,
      type: "number",
    })
    .option("f", {
      alias: "difficulty",
      requiresArg: true,
      describe: "The estimated difficulty of the assessment",
      nargs: 1,
      type: "number",
    })
    .option("s", {
      alias: "services",
      requiresArg: true,
      describe: "The estimated time to complete the assessment",
      choices: ["Redis", "MongoDB", "PostgreSQL"],
      type: "array",
    });
}

async function handler(config) {
  const headers = {
    Authorization: config.qualifiedApiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const module = await selectModule(config.webDevPath);

  const checkpoint = await selectCheckpoint(config.webDevPath, module);

  const options = await challengeOptions()

  const checkpointFolder = path.join(config.webDevPath, "library", checkpoint);

  try {
    const savedChallenge = await saveChallenge(
      checkpoint,
      checkpointFolder,
      module.name,
      module.code,
      options,
      config.debug,
      headers
    );

    const savedAssessment = await saveAssessment(
      checkpoint,
      checkpointFolder,
      savedChallenge.data.title,
      savedChallenge.data.labels,
      config.debug,
      headers
    );

    console.log("Done");
    console.log("Commit any new or updated .json files to the repository.");
    console.log(
      "Also add the challenge to the assessment and publish the assessment."
    );
    console.log(
      `https://www.qualified.io/v1/challenges/${savedChallenge.data.id}`
    );
    console.log(
      `https://www.qualified.io/v1/assessments/${savedAssessment.data.id}`
    );
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  command,
  describe,
  builder,
  handler,
};
