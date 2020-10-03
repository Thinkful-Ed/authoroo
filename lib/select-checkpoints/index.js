const { capitalCase } = require("capital-case");
const inquirer = require("inquirer");
const selectModule = require("../select-module");

async function selectCheckpoints(config) {
  const module = await selectModule(config);

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
