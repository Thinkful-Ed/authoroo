const fs = require("fs");
const path = require("path");
const selectCheckpoints = require("../select-checkpoints");
const { spawn } = require("child_process");

const debug = require("../debug")(__dirname, __filename);

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
      coerce: (arg) =>
        arg ? (command, args) => console.log(args.join("\n\n")) : spawn,
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
      path.join(config.webDevPath, "library", checkpoint, "assessment.json")
    )
    .map((assessmentFile) =>
      JSON.parse(fs.readFileSync(assessmentFile).toString())
    )
    .flatMap((assessment) =>
      assessment.data.challengeItems.map(
        (challengeItem) =>
          `https://www.qualified.io/hire/challenges/${challengeItem.challengeId}`
      )
    );

  debug("urls", urls);

  config.e("open", urls);
}

module.exports = {
  command,
  describe,
  builder,
  handler,
};
