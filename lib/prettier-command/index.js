const path = require("path");
const selectModule = require("../select-module");

const { exec } = require("child_process");

const command = "prettier";
const describe =
  "Prompts for zid module and then runs prettier on every directory for the module.";

function builder(yargs) {
  return yargs;
}

async function handler(config) {
  const module = await selectModule(config.webDevPath);

  const command = [
    "npx",
    "prettier",
    "--write",
    path.join(config.webDevPath, "library", `${module.code}-*`),
  ];

  exec(command.join(" "), (error, stdout, stderr) => {
    if (error) {
      console.error("exec error:", error);
      return;
    }
    console.log("done", stdout);
  });
}

module.exports = {
  command,
  describe,
  builder,
  handler,
};
