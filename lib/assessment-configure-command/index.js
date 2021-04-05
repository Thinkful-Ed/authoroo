const directoryTree = require("directory-tree");
const fs = require("fs");
const path = require("path");
const selectCheckpoint = require("../select-checkpoint");

const debug = require("../debug")(__dirname, __filename);

const { readdir } = fs.promises;

const readOnlyPath = new RegExp(
  `(^|\\${path.sep})(test|tests|__test__|__tests__|__mocks__)\\${path.sep}`
);

const excludeFolders = /\.idea|\.vscode|node_modules/;

const command = "assessment-configure";
const describe =
  "Prompts for a module and then checkpoint, then generates a default authoroo.json file in the checkpoint folder.";

function builder(yargs) {
  return yargs
    .option("c", {
      alias: "checkpoint-folder",
      demandOption: false,
      type: "string",
      describe:
        "the path of the checkpoint folder inside of library (omit `./library` i.e. `<checkpoint-folder-name>`",
    })
    .option("n", {
      alias: "multiple-challenges",
      demandOption: false,
      type: "boolean",
      describe: "indicates the qualified folder contains multiple challenges",
    });
}

async function handler(config) {
  const checkpoint = config["checkpoint-folder"]
    ? config["checkpoint-folder"]
    : await selectCheckpoint(config.webDevPath);

  const authorooJsonFile = path.join(
    config.webDevPath,
    "library",
    checkpoint,
    "authoroo.json"
  );

  // TODO: if exists, read and look for checkpoints property
  // prompt for single or multiple challenge assessment?

  const authorooJson = fs.existsSync(authorooJsonFile)
    ? require(authorooJsonFile)
    : { files: [], exclude: [] };

  const isMultiple = authorooJson.challenges || config["multiple-challenges"];

  debug("authorooJson", authorooJson, isMultiple);

  const qualifiedFolder = path.join(
    config.webDevPath,
    "library",
    checkpoint,
    "qualified"
  );

  if (isMultiple) {
    delete authorooJson.files;
    delete authorooJson.exclude;

    authorooJson.challenges = authorooJson.challenges || [];

    const contents = await readdir(qualifiedFolder, { withFileTypes: true });

    const qualifiedFolders = contents
      .filter((file) => file.isDirectory())
      .filter((file) => !excludeFolders.test(file.name))
      .map((file) => file.name);

    debug("qualifiedFolders", qualifiedFolders);

    authorooJson.challenges = qualifiedFolders.map((folder) => {
      const challenge = authorooJson.challenges.find(
        (theChallenge) => theChallenge.folder === folder
      ) || { folder, files: [], exclude: [] };

      const setting = toAuthorooSettings(
        path.join(qualifiedFolder, folder),
        challenge
      );
      setting.folder = folder;
      return setting;
    });
  } else {
    authorooJson.files = toAuthorooSettings(
      qualifiedFolder,
      authorooJson
    ).files;
  }

  debug("authorooJson", authorooJson);

  fs.writeFileSync(authorooJsonFile, JSON.stringify(authorooJson, null, 4));

  console.log(`Updated ${authorooJsonFile}`);
  return Promise.resolve(authorooJson);
}

function theChildren(node) {
  debug("node", node);
  const { children = [], ...nodeSansChildren } = node;
  return [nodeSansChildren].concat(children.flatMap(theChildren));
}

function toAuthorooSettings(folder, challenge) {
  debug("toAuthorooSettings", folder, challenge);

  const solutionFolder = path.join(folder, "solution");
  const exclude = (challenge.exclude || [])
    .map((expression) => new RegExp(expression))
    .concat([
      /\.(gif|jpe?g|tiff?|png|webp|bmp|ico)$/i,
      /\.dockerignore/,
      /\.DS_Store/,
      /\.env/,
      /\.env\..*/,
      /\.gitignore/,
      /\.gitkeep/,
      /\.idea/,
      /\.vscode/,
      /challenge.json/,
      /docker-compose.yaml/,
      /Dockerfile/,
      /node_modules/,
      /package-lock.json/,
      /readme.md/i,
      new RegExp(solutionFolder),
    ]);

  debug("exclude", exclude);

  const folderWithDelimiter = `${folder}${path.sep}`;

  debug("folderWithDelimiter", folderWithDelimiter);

  challenge.files = directoryTree(folder, {
    exclude,
  })
    .children.flatMap(theChildren)
    .filter((treeNode) => treeNode.type !== "directory")
    .map((treeNode) => {
      const path = treeNode.path.replace(folderWithDelimiter, "");

      const authorooSettings =
        challenge.files.find((file) => file.path === path) || {};

      return {
        path,
        access: readOnlyPath.test(path) ? "readonly" : "readwrite",
        ...authorooSettings,
      };
    });

  return challenge;
}

module.exports = {
  command,
  describe,
  builder,
  handler,
  readOnlyPath,
};
