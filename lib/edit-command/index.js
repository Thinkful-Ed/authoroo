const spawn = require("child_process").spawn;
const path = require("path");
const selectCheckpoints = require("../select-checkpoints");
const debug = require("../debug")(__dirname, __filename);

const command = "edit";
const describe =
  "Prompts for a module and then the checkpoint you wish to edit.";

function builder(yargs) {
  return yargs.option("c", {
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

  const documents = checkpoints.map((checkpoint) =>
    path.join(config.webDevPath, "library", checkpoint, "content.md")
  );

  debug(documents);

  spawn("open", documents);
}

module.exports = {
  command,
  describe,
  builder,
  handler,
};
