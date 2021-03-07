const path = require("path");
const { spawn } = require("child_process");

const selectCheckpoints = require("../select-checkpoints");

const debug = require("debug")("authoroo:view-challenge:index");

const command = "view-challenge";
const describe =
  "Prompts for a module and checkpoint then opens the qualified.io challenge in your default browser.";

function builder(yargs) {
  return yargs
    .option("echo", {
      alias: "e",
      describe: "echo the challenge url rather than open it",
      default: false,
      type: "boolean",
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
  const checkpoints = config["checkpoint-folder"]
    ? [config["checkpoint-folder"]]
    : await selectCheckpoints(config.webDevPath);

  debug("checkpoints", checkpoints);

  const urls = checkpoints
    .map((checkpoint) =>
      path.join(config.webDevPath, "library", checkpoint, "challenge.json")
    )
    .map((challengeJson) => require(challengeJson))
    .map(
      (challenge) =>
        `https://www.qualified.io/hire/challenges/${challenge.data.id}`
    );

  debug("urls", urls);

  if (config.e) {
    console.log(urls.join("\n\n"));
  } else {
    spawn("open", urls);
  }
}

module.exports = {
  command,
  describe,
  builder,
  handler,
};
