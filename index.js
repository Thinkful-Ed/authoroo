const yargs = require("yargs");
const answersCommand = require("./lib/answers-command");
const assessmentCommand = require("./lib/assessment-command");
const editCommand = require("./lib/edit-command");
const initCommand = require("./lib/init-command");
const prettierCommand = require("./lib/prettier-command");
const viewCommand = require("./lib/view-command");

const config = yargs
  .scriptName("authoroo")
  .usage(
    "Run this utility from the root of the web-dev-programs folder.\n\nUsage: $0 [command] [options]"
  )
  .example(
    "$0 init [module]",
    "Initialize the checkpoints specified in the module file"
  )
  .env("AUTHOROO")
  .option("w", {
    alias: "webDevPath",
    default: process.env.WEB_DEV_PATH || process.cwd(),
    demandOption: true,
    describe:
      "Path to the web-dev-project folder. Defaults to env.WEB_DEV_PATH or current working directory if WEB_DEV_PATH is not set.",
    nargs: 1,
    type: "string",
  })
  .option("d", {
    alias: "debug",
    default: 0,
    demandOption: false,
    describe: "Enable debug mode.",
    count: true,
    type: "boolean",
  })
  .command(initCommand)
  .command(editCommand)
  .command(prettierCommand)
  .command(viewCommand)
  .command(answersCommand)
  .command(assessmentCommand)
  .help("h")
  .alias("h", "help")
  .alias("v", "version")
  .epilog("copyright 2020")
  .wrap(yargs.terminalWidth())
  .demandCommand()
  .strict().argv;
