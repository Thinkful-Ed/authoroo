const fs = require("fs");
const path = require("path");

const readYaml = require("../readYaml");
const mkdir = require("../mkdir");
const writeFile = require("../writeFile");

const yaml = require("js-yaml");
const { capitalCase } = require("capital-case");
const Handlebars = require("handlebars");
const { registerDecorator } = require("handlebars");

const templates = {
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

async function initModule(config) {
  const module = await readYaml(config.moduleYaml);

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
        template: index < array.length - 1 ? "checkpoint" : "assignment",
      };
    })
    .forEach(writeContent(config.webDevPath));
}

function writeContent(webDevPath) {
  return async (checkpoint) => {
    const targetDirectory = await mkdir(
      path.join(webDevPath, "library", checkpoint.directory)
    );

    const content = templates[checkpoint.template](checkpoint);
    return await writeFile(path.join(targetDirectory, "content.md"), content);
  };
}

module.exports = initModule;
