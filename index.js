const path = require("path");
const yargs = require("yargs");
const initModule = require("./lib/init");
const editModule = require("./lib/edit");

const options = yargs
  .scriptName("authoroo")
  .usage("Run this utility from the root of the web-dev-programs folder.\n\nUsage: $0 [command] [options]")
  .example(
    "$0 init [module]",
    "Initialize the checkpoints specified in the module file"
  )
  .env('AUTHOROO')
  .config('json')
  .alias("j", "json")
  .option("w", {
    alias: "webDevPath",
    default: process.env.WEB_DEV_PATH || process.cwd(),
    demandOption: true,
    describe:
      "Path to the web-dev-project folder. Defaults to env.WEB_DEV_PATH or current working directory if WEB_DEV_PATH is not set.",
    nargs: 1,
    type: "string",
  })
  .command(
    "init [module-yaml]",
    "Initialize checkpoints from the speficied module yaml file.",
    (yargs) => {
      yargs.positional("module-yaml", {
        type: "string",
        describe: "the path to the module yaml file",
      });
    },
    initModule
  )
  .command(
    "edit",
    "Prompts for zid module and then document you wish to edit.",
    (yargs) => yargs,
    editModule
  )
  .help("h")
  .alias("h", "help")
  .alias("v", "version")
  .epilog("copyright 2020")
  .wrap(yargs.terminalWidth())
  .demandCommand()
  .strict().argv;
