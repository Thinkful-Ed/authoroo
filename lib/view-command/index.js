const {spawn, spawnSync} = require("child_process");
const readYaml = require("../readYaml");
const inquirer = require("inquirer");
const { capitalCase } = require("capital-case");
const selectModule = require("../select-module");

const branchDefault = getCurrentBranch()

const command = "view [branch]";
const describe =
  "Prompts for zid module and then document you wish to view on GitHub";

function builder(yargs) {
  return yargs
    .positional("branch", {
      type: "string",
      describe: "the name of the branch",
      default: branchDefault,
    })
    .option("echo", {
      alias: "e",
      describe: "echo the GitHub link rather than open it",
      default: false,
      type: "boolean",
    });
}

async function handler(config) {
  const moduleYaml = await selectModule(config);

  const module = await readYaml(moduleYaml);

  const allDocuments = module.checkpoints.map(
    (checkpoint) =>
      `https://github.com/Thinkful-Ed/web-dev-programs/tree/${config.branch}/library/${checkpoint}/content.md`
  );

  const choices = module.checkpoints
    .map((checkpoint, index) => {
      return {
        key: index.toString(),
        name: capitalCase(checkpoint.replace(`${module.code}-`, "")),
        value: [
          `https://github.com/Thinkful-Ed/web-dev-programs/tree/${config.branch}/library/${checkpoint}/content.md`,
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
      if (config.e) {
        console.log(answers.documents.join("\n\n"));
      } else {
        spawn("open", answers.documents);
      }
    })
    .catch(console.error);
}

function getCurrentBranch() {
  const child = spawnSync("git", ["branch", "--show-current"], { encoding : 'utf8' });
  return (child.stdout || 'master').trim()
}

module.exports = {
  command,
  describe,
  builder,
  handler,
};
