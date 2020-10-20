const { capitalCase } = require("capital-case");
const inquirer = require("inquirer");
const selectModule = require("../select-module");

/**
 * Selects one, or all, checkpoints from a module.
 *
 * If `module` is specified, it is assumed that module selection happened earlier in the process,
 * otherwise the user is prompted to select the module.
 *
 * @param {String} webDevPath
 *  the path to the web-dev-projects repository
 * @param module
 *  optional module to use rather than prompting user for the module.
 */
async function selectCheckpoints(webDevPath, module) {
  if (!module) {
    module = await selectModule(webDevPath);
  }

  const choices = module.checkpoints
    .map((checkpoint, index) => {
      return {
        key: (index++).toString(),
        name: capitalCase(checkpoint.replace(`${module.code}-`, "")),
        value: [checkpoint],
      };
    })
    .concat({
      key: module.checkpoints.length.toString(),
      name: `All ${module.checkpoints.length} checkpoints`,
      value: module.checkpoints,
    });
  const questions = [
    {
      type: "list",
      name: "checkpoints",
      message: "Which checkpoint?",
      choices,
      pageSize: choices.length,
    },
  ];
  return inquirer.prompt(questions).then((anwers) => anwers.checkpoints);
}

module.exports = selectCheckpoints;
