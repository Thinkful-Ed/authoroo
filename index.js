const yargs = require("yargs");
const answersCommand = require("./lib/answers-command");
const assessmentCommand = require("./lib/assessment-command");
const editCommand = require("./lib/edit-command");
const extractCommand = require("./lib/extract-command");
const initCommand = require("./lib/init-command");
const prettierCommand = require("./lib/prettier-command");
const viewCommand = require("./lib/view-command");

const fs = require("fs");
const path = require("path");

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
  .option("d", {
    alias: "debug",
    default: 0,
    demandOption: false,
    describe: "Enable debug mode.",
    count: true,
    type: "boolean",
  })
  .option("w", {
    alias: "webDevPath",
    default: process.env.WEB_DEV_PATH || process.cwd(),
    demandOption: true,
    describe:
      "Path to the web-dev-programs folder. Defaults to env.WEB_DEV_PATH or the current working directory if WEB_DEV_PATH is not set.",
    nargs: 1,
    type: "string",
  })
  .coerce('w', function (webDevPath) {
    if (fs.existsSync(path.join(webDevPath, 'modules'))) {
      return webDevPath
    }
    throw new Error("Required `modules` folder not found.  Run this command from the root of the `web-dev-programs` folder, set the WEB_DEV_PATH environment variable, or specify -w <path-to-web-dev-programs-folder>.")
  })
  .command(initCommand)
  .command(editCommand)
  .command(prettierCommand)
  .command(viewCommand)
  .command(answersCommand)
  .command(assessmentCommand)
  .command(extractCommand)
  .help("h")
  .alias("h", "help")
  .alias("v", "version")
  .epilog("copyright 2020")
  .wrap(yargs.terminalWidth())
  .demandCommand()
  .strict().argv;
