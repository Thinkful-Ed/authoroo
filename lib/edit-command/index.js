const spawn = require("child_process").spawn;
const readYaml = require("../readYaml");
const path = require("path");
const inquirer = require("inquirer");
const { capitalCase } = require("capital-case");
const selectModule = require("../select-module");

const command = "edit";
const describe = "Prompts for zid module and then document you wish to edit.";

function builder(yargs) {
  return yargs;
}

async function handler(config) {
  const moduleYaml = await selectModule(config);

  const module = await readYaml(moduleYaml);

  const allDocuments = module.checkpoints.map((checkpoint) =>
    path.join(config.webDevPath, "library", checkpoint, "content.md")
  );

  const choices = module.checkpoints
    .map((checkpoint, index) => {
      return {
        key: index.toString(),
        name: capitalCase(checkpoint.replace(`${module.code}-`, "")),
        value: [
          path.join(config.webDevPath, "library", checkpoint, "content.md"),
        ],
      };
    })
    .concat({
      key: allDocuments.length.toString,
      name: `All ${allDocuments.length} documents`,
      value: allDocuments,
    });

  const questions = [
    {
      type: "list",
      name: "documents",
      message: "Which document?",
      choices,
      pageSize: choices.length,
    },
  ];

  inquirer
    .prompt(questions)
    .then((answers) => {
      spawn("open", answers.documents);
    })
    .catch(console.error);
}

module.exports = {
  command,
  describe,
  builder,
  handler,
};
