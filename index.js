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

const debug = require("debug")("authoroo");

const config = yargs
  .scriptName("authoroo")
  .usage(
    "Run this utility from the root of the web-dev-programs folder.\n\nUsage: $0 <command> [options]"
  )
  .example([
    ["$0 [-h]", "Display this help message"],
    ["$0 <command> -h", "Display help for the specified <command>"],
    ["$0 init", "Initialize the checkpoints specified in the module file"],
    [
      "$0 extract -q <qualified-api-key>",
      "Extract an assessment from qualified.io into the selected checkpoint",
    ],
    [
      "$0 assessment -q <qualified-api-key>",
      "Publish the selected checkpoint '/qualified' folder to qualified.io",
    ],
    [
      "DEBUG=* $0 <command>",
      "Enable debugging using the DEBUG environment variable",
    ],
  ])
  .env("AUTHOROO")
  .option("w", {
    alias: "webDevPath",
    default: process.env.WEB_DEV_PATH || process.cwd(),
    demandOption: true,
    describe:
      "Path to the web-dev-programs folder. Defaults to env.WEB_DEV_PATH or the current working directory if WEB_DEV_PATH is not set.",
    nargs: 1,
    type: "string",
  })
  .coerce("w", function (webDevPath) {
    if (fs.existsSync(path.join(webDevPath, "modules"))) {
      return webDevPath;
    }
    throw new Error(
      "Required `modules` folder not found.  Run this command from the root of the `web-dev-programs` folder, set the WEB_DEV_PATH environment variable, or specify -w <path-to-web-dev-programs-folder>."
    );
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
  .epilog(`copyright 2020-${new Date().getFullYear()}`)
  .wrap(yargs.terminalWidth())
  .demandCommand()
  .strict().argv;

debug("config", config);
