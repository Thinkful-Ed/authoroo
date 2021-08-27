const updateEnableDownloads = require("./updateEnableDownloads");

const debug = require("../debug")(__dirname, __filename);

const command = "update-challenge-options";
const describe =
  "Updates challenge options by doing a PUT request using Qualified API";

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
    .option("c", {
      alias: "challengeJsonPath",
      demandOption: true,
      type: "string",
      describe: "json file with challenges to be updated",
    })
    .option("o", {
      alias: "option",
      demandOption: true,
      type: "string",
      describe: "the configuration option",
    })
    .option("e", {
      alias: "enable",
      demandOption: false,
      type: "boolean",
      describe: "enable (true) or disable (false) option",
    })
}

async function handler(config) {
  if (config.option == "enableFileDownloads"){
      console.log("Enabling (or disabling) file downloads...");
      const challenge = await updateEnableDownloads(
        config.qualifiedApiKey,
        config.challengeJsonPath,
        config.enable
      );
      debug("challenge", challenge);
      console.log("Done");
  }
}

module.exports = {
  command,
  describe,
  builder,
  handler,
};
