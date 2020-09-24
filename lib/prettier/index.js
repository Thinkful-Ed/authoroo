const spawn = require("child_process").spawn;
const readYaml = require("../readYaml");
const path = require("path");
const inquirer = require("inquirer");
const { capitalCase } = require("capital-case");
const selectModule = require("../select-module");

const { exec } = require("child_process");

async function prettierModule(config) {
  const moduleYaml = await selectModule(config);

  const module = await readYaml(moduleYaml);

  const command = [
    "npx",
    "prettier",
    "--write",
    path.join(config.webDevPath, "library", `${module.code}-*`),
  ];

  exec(command.join(" "), (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.error(`stderr: ${stderr}`);
    console.log(`stdout: ${stdout}`);
  });
}

module.exports = prettierModule;
