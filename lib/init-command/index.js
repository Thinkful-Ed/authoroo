const fs = require("fs");
const path = require("path");

const { capitalCase } = require("capital-case");
const Handlebars = require("handlebars");
const selectModule = require("../select-module");

const command = "init";
const describe =
  "Prompts for zid module and then initializes the checkpoints for the module.";

function builder(yargs) {
  return yargs;
}

async function handler(config) {
  const module = await selectModule(config.webDevPath);

  const indexToTemplate = {
    0: "overview",
    [module.checkpoints.length - 1]: "assignment",
  };

  module.checkpoints
    .map((name, index) => {
      const { checkpoints, ...rest } = module;
      const checkpointCode = name.replace(
        new RegExp(`^${module.code}-(\\d\\d|XX)-`, "i"),
        ""
      );
      return {
        ...rest,
        directory: name,
        checkpointCode,
        title: capitalCase(checkpointCode),
        template: indexToTemplate[index] || "checkpoint",
      };
    })
    .forEach(writeContent(config.webDevPath));
}

function writeContent(webDevPath) {
  return async (checkpoint) => {
    const templates = loadTemplates();

    const targetFolder = path.join(webDevPath, "library", checkpoint.directory);

    await fs.promises.mkdir(targetFolder, { recursive: true });

    const content = templates[checkpoint.template](checkpoint);

    return await fs.promises.writeFile(
      path.join(targetFolder, "content.md"),
      content
    );
  };
}

function loadTemplates() {
  return {
    overview: Handlebars.compile(
      fs
        .readFileSync(path.join(__dirname, "overview.handlebars"), "utf8")
        .toString()
    ),
    checkpoint: Handlebars.compile(
      fs
        .readFileSync(path.join(__dirname, "checkpoint.handlebars"), "utf8")
        .toString()
    ),
    assignment: Handlebars.compile(
      fs
        .readFileSync(path.join(__dirname, "assignment.handlebars"), "utf8")
        .toString()
    ),
  };
}

module.exports = {
  command,
  describe,
  builder,
  handler,
};
