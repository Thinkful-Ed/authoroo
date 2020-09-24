const inquirer = require("inquirer");
const listModules = require("../list-modules");

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
      type: "rawlist",
      name: "module",
      message: "Which module?",
      choices,
      pageSize: 11,
    },
  ];
  return inquirer.prompt(questions).then((anwers) => anwers.module);
}

module.exports = selectModule;
