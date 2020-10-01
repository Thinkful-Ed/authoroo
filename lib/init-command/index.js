const fs = require("fs");
const path = require("path");

const readYaml = require("../readYaml");
const mkdir = require("../mkdir");
const writeFile = require("../writeFile");

const yaml = require("js-yaml");
const { capitalCase } = require("capital-case");
const Handlebars = require("handlebars");
const { registerDecorator } = require("handlebars");

const command = "init <module-yaml>";
const describe = "Initialize checkpoints from the speficied module yaml file.";

function builder(yargs) {
  return yargs.positional("module-yaml", {
    type: "string",
    describe: "the path to the module yaml file",
  });
}

async function handler(config) {
  const module = await readYaml(config.moduleYaml);

  const indexToTemplate = {
    0: "overview",
    [module.checkpoints.length - 1]: "assignment",
  };

  module.checkpoints
    .map((name, index, array) => {
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

    const targetDirectory = await mkdir(
      path.join(webDevPath, "library", checkpoint.directory)
    );

    const content = templates[checkpoint.template](checkpoint);
    return await writeFile(path.join(targetDirectory, "content.md"), content);
  };
}

function loadTemplates() {
  return {
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
