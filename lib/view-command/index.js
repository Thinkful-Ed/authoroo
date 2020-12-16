const { spawn, spawnSync } = require("child_process");
const inquirer = require("inquirer");
const selectCheckpoints = require("../select-checkpoints");

const command = "view [branch]";
const describe =
  "Prompts for zid module and then checkpoint you wish to view on GitHub";

function builder(yargs) {
  return yargs
    .positional("branch", {
      type: "string",
      describe: "the name of the branch",
      default: getCurrentBranch(),
    })
    .option("echo", {
      alias: "e",
      describe: "echo the GitHub link rather than open it",
      default: false,
      type: "boolean",
    });
}

async function handler(config) {
  const checkpoints = await selectCheckpoints(config.webDevPath);

  const urls = checkpoints.map(
    (checkpoint) =>
      `https://github.com/Thinkful-Ed/web-dev-programs/tree/${config.branch}/library/${checkpoint}/content.md`
  );

  if (config.e) {
    console.log(urls.join("\n\n"));
  } else {
    spawn("open", urls);
  }
}

function getCurrentBranch() {
  const child = spawnSync("git", ["branch", "--show-current"], {
    encoding: "utf8",
  });
  return (child.stdout || "master").trim();
}

module.exports = {
  command,
  describe,
  builder,
  handler,
};
