const { capitalCase } = require("capital-case");
const inquirer = require("inquirer");
const selectModule = require("../select-module");

/**
 * Selects exactly one checkpoints from a module.
 *
 * If `module` is specified, it is assumed that module selection happened earlier in the process,
 * otherwise the user is prompted to select the module.
 *
 * @param {String} webDevPath
 *  the path to the web-dev-projects repository
 * @param module
 *  optional module to use rather than prompting user for the module.
 */
async function selectCheckpoint(webDevPath, module) {
  if (!module) {
    module = await selectModule(webDevPath);
  }

  const choices = module.checkpoints.map((checkpoint, index) => {
    return {
      key: (index++).toString(),
      name: capitalCase(checkpoint.replace(`${module.code}-`, "")),
      value: checkpoint,
    };
  });

  const question = {
    type: "list",
    name: "checkpoint",
    message: "Which checkpoint?",
    choices,
    pageSize: choices.length,
  };
  return inquirer.prompt([question]).then((answers) => answers.checkpoint);
}

module.exports = selectCheckpoint;
