const readFromQualified = require("../read-from-qualified");
const extractSolution = require("./extractSolution");

const debug = require("../debug")(__dirname, __filename);

const command = "extract-solution";
const describe =
  "Extracts the files from the qualified solution (work completed by a student) into a folder, overwriting any existing files.";

function builder(yargs) {
  return yargs
    .config()
    .option("q", {
      alias: "qualifiedApiKey",
      demandOption: true,
      describe:
        "Qualified API access key copied from https://www.qualified.io/hire/account/integrations#api-key.",
      nargs: 1,
      type: "string",
    })
    .option("d", {
      alias: "destination-folder",
      demandOption: false,
      default: process.env.HOME,
      type: "string",
      describe: "the full path of the destination folder.",
    })
    .option("s", {
      alias: "solution-id",
      demandOption: true,
      type: "string",
      describe: "the id of the solution",
    })
    .option("p", {
      alias: "docker-port",
      demandOption: true,
      type: "number",
      describe: "the port exposed by docker",
    });
}

async function handler(config) {
  const solution = await readFromQualified(
    config.qualifiedApiKey,
    "solutions",
    config["solution-id"]
  );

  debug("solution", solution);

  const solutionFolder = await extractSolution(
    solution,
    config["destination-folder"],
    config["docker-port"]
  );

  console.log("Solution extracted to", solutionFolder);
  console.log("Review the Dockerfile for necessary changes and then run");
  console.log("npm run test:solution");
  console.log("Done");
}

module.exports = {
  command,
  describe,
  builder,
  handler,
};
