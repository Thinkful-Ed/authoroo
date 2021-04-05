const fs = require("fs");
const path = require("path");
const readChallengeFolder = require("../read-challenge-folder");
const uploadChallenge = require("./uploadChallenge");

const debug = require("../debug")(__dirname, __filename);

const command = "upload-challenge";
const describe =
  "Uploads the current directory a pre-existing challenge. There must be an existing challenge.json files in the folder, and no qualified folder. Only files and instructions are updated, nothing else about the challenge is changed.";

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
    .option("u", {
      alias: "upload-folder",
      demandOption: true,
      type: "string",
      describe:
        "the path of the upload folder inside of library (omit `./library` i.e. `<checkpoint-folder-name>` or `<checkpoint-folder-name>/<sub-folder-name>`",
    });
}

async function handler(config) {
  const uploadFolder = path.join(
    config.webDevPath,
    "library",
    config["upload-folder"]
  );

  const challengeFile = path.join(uploadFolder, "challenge.json");

  if (!fs.existsSync(challengeFile)) {
    throw new Error(`challenge.json not found: ${challengeFile}`);
  }

  const existingChallenge = require(challengeFile);

  debug("existingChallenge", existingChallenge);

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
    uploadFolder,
    filePathToId,
    referenceFilePathToId
  );

  debug("folderInfo", folderInfo);

  try {
    const savedChallenge = await uploadChallenge(
      config,
      existingChallenge,
      folderInfo
    );

    fs.writeFileSync(challengeFile, JSON.stringify(savedChallenge, null, 4));

    console.log("Done");
    console.log("Commit any the challenge.json files to the repository.");
    console.log(
      "Also visit the assessment link below to publish the assessment."
    );
    console.log(
      `https://www.qualified.io/hire/challenges/${savedChallenge.data.id}`
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
