const spawn = require("child_process").spawn;
const path = require("path");
const selectCheckpoints = require("../select-checkpoints");

const command = "edit";
const describe = "Prompts for zid module and then document you wish to edit.";

function builder(yargs) {
  return yargs;
}

async function handler(config) {
  const checkpoints = await selectCheckpoints(config.webDevPath);

  const documents = checkpoints.map((checkpoint) =>
    path.join(config.webDevPath, "library", checkpoint, "content.md")
  );

  spawn("open", documents);
}

module.exports = {
  command,
  describe,
  builder,
  handler,
};
