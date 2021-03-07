const fs = require("fs");
const path = require("path");
const selectCheckpoint = require("../select-checkpoint");
const selectModule = require("../select-module");
const saveChallenge = require("./saveChallenge");
const saveAssessment = require("./saveAssessment");
const challengeOptions = require("../challenge-options");
const saveChallengeItem = require("./saveChallengeItem");
const readYaml = require("../read-yaml");
const readChallengeFolder = require("../read-challenge-folder");

const debug = require("debug")("authoroo:publish:index");

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
    .option("m", {
      alias: "module-name",
      demandOption: false,
      type: "string",
      describe:
        "the name of the module.yaml (without the .yaml extension) file that defines the module",
    })
    .option("c", {
      alias: "checkpoint-folder",
      demandOption: false,
      type: "string",
      describe:
        "the path of the checkpoint folder inside of library (omit `./library` i.e. `<checkpoint-folder-name>`",
    });
}

async function handler(config) {
  const headers = {
    Authorization: config.qualifiedApiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const module = config["module-name"]
    ? await readYaml(
        path.join(config.webDevPath, "modules", `${config["module-name"]}.yaml`)
      )
    : await selectModule(config.webDevPath);

  const checkpoint = config["checkpoint-folder"]
    ? config["checkpoint-folder"]
    : await selectCheckpoint(config.webDevPath, module);

  const checkpointFolder = path.join(config.webDevPath, "library", checkpoint);

  const qualifiedFolder = path.join(checkpointFolder, "qualified");

  if (!fs.existsSync(qualifiedFolder)) {
    throw new Error(`Qualified folder not found: ${qualifiedFolder}`);
  }

  const challengeFile = path.join(checkpointFolder, "challenge.json");

  const existingChallenge = fs.existsSync(challengeFile)
    ? require(challengeFile)
    : { data: {} };

  debug("existingChallenge", existingChallenge);

  const options = await challengeOptions(existingChallenge.data);

  const filePathToId = (existingChallenge.data.files || []).reduce(
    (accumulator, file) => {
      accumulator[file.path] = file.id;
      return accumulator;
    },
    {}
  );

  const referenceFilePathToId = (
    existingChallenge.data.referenceFiles || []
  ).reduce((accumulator, file) => {
    accumulator[file.path] = file.id;
    return accumulator;
  }, {});

  const folderInfo = readChallengeFolder(
    qualifiedFolder,
    filePathToId,
    referenceFilePathToId
  );

  debug("folderInfo", folderInfo);

  try {
    const savedChallenge = await saveChallenge(
      existingChallenge.data.id,
      qualifiedFolder,
      checkpoint,
      module.name,
      module.code,
      options,
      headers,
      folderInfo
    );

    fs.writeFileSync(challengeFile, JSON.stringify(savedChallenge, null, 4));

    const savedAssessment = await saveAssessment(
      checkpoint,
      checkpointFolder,
      savedChallenge,
      headers
    );

    await saveChallengeItem(
      checkpointFolder,
      savedAssessment.data.id,
      savedChallenge.data.id,
      checkpoint,
      headers,
      config.qualifiedApiKey
    );

    console.log("Done");
    console.log("Commit any new or updated .json files to the repository.");
    console.log(
      "Also visit the assessment link below to publish the assessment."
    );
    console.log(
      `https://www.qualified.io/hire/challenges/${savedChallenge.data.id}`
    );
    console.log(
      `https://www.qualified.io/hire/assessments/${savedAssessment.data.id}`
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
  aliases: ["assessment"],
};
