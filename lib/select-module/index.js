const inquirer = require("inquirer");
const listModules = require("../list-modules");
const readYaml = require("../readYaml");

async function selectModule(config) {
  const modules = await listModules(config);
  const choices = modules.map((module, index) => {
    return {
      key: (index++).toString(),
      name: module.replace(/^modules[\\|/]/i, "").replace(".yaml", ""),
      value: module,
    };
  });
  const questions = [
    {
      type: "list",
      name: "moduleYaml",
      message: "Which module?",
      choices,
      pageSize: 11,
    },
  ];
  return inquirer
    .prompt(questions)
    .then(({ moduleYaml }) => moduleYaml)
    .then(readYaml);
}

module.exports = selectModule;
