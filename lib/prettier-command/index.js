const path = require("path");
const selectModule = require("../select-module");

const { exec } = require("child_process");

const command = "prettier";
const describe =
  "Prompts for a module and then uses the modules `.yaml` file to run prettier on every checkpoint in the the module.";

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
