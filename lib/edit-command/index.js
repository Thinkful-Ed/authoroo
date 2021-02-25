const spawn = require("child_process").spawn;
const path = require("path");
const selectCheckpoints = require("../select-checkpoints");
const debug = require("debug")("authoroo:edit:index");

const command = "edit";
const describe = "Prompts for a module and then the checkpoint you wish to edit.";

function builder(yargs) {
  return yargs;
}

async function handler(config) {
  const checkpoints = await selectCheckpoints(config.webDevPath);

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
