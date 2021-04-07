const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");

const fsPromises = fs.promises;

const debug = require("../debug")(__dirname, __filename);

async function writeDockerFiles(targetFolder, context) {
  const dockerFolder = path.join(__dirname, "..", "docker");
  const dockerTemplateFiles = await fsPromises.readdir(dockerFolder);

  const fileInfos = dockerTemplateFiles
    .filter((file) => fs.existsSync(path.join(targetFolder, file)) === false)
    .map((file) => ({
      source: path.join(dockerFolder, file),
      target: path.join(targetFolder, file),
    }));

  const fileInfosWithContents = await Promise.all(
    fileInfos.map((fileInfo) =>
      fsPromises
        .readFile(fileInfo.source)
        .then((buffer) => ({ ...fileInfo, sourceContents: buffer.toString() }))
    )
  );

  const fileInfosWithTemplates = fileInfosWithContents
    .map((fileInfo) => ({
      ...fileInfo,
      template: Handlebars.compile(fileInfo.sourceContents),
    }))
    .map((fileInfo) => ({
      ...fileInfo,
      targetContents: fileInfo.template(context),
    }));

  debug("fileInfosWithTemplates", fileInfosWithTemplates);

  return Promise.all(
    fileInfosWithTemplates.map((fileInfo) =>
      fsPromises.writeFile(fileInfo.target, fileInfo.targetContents)
    )
  );
}

module.exports = writeDockerFiles;
