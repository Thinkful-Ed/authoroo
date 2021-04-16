const directoryTree = require("directory-tree");
const path = require("path");
const fs = require("fs");
const { readOnlyPath } = require("../assessment-configure-command");

const debug = require("../debug")(__dirname, __filename);

function readChallengeFolder(
  authorooJson,
  folder,
  filePathToId,
  referenceFilePathToId
) {
  debug(
    "readChallengeFolder",
    authorooJson,
    folder,
    filePathToId,
    referenceFilePathToId
  );

  const solutionFolder = path.join(folder, "solution");

  const exclude = (authorooJson.exclude || [])
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

  const files = directoryTree(folder, { exclude })
    .children.flatMap(theChildren)
    .filter((treeNode) => treeNode.type !== "directory")
    .map(toAdvancedCodeChallengeFile(folder, filePathToId, authorooJson));

  const referenceFiles = directoryTree(solutionFolder, {
    exclude: [/.gitkeep/, /.DS_Store/, /Dockerfile/i, /docker-compose.yaml/],
  })
    .children.flatMap(theChildren)
    .filter((treeNode) => treeNode.type !== "directory")
    .map(
      toAdvancedCodeChallengeReferenceFile(
        solutionFolder,
        referenceFilePathToId
      )
    );

  const instructions = fs
    .readFileSync(path.join(folder, "README.md"))
    .toString();

  return {
    instructions,
    files,
    referenceFiles,
  };
}

function theChildren(node) {
  const { children = [], ...nodeSansChildren } = node;
  return [nodeSansChildren].concat(children.flatMap(theChildren));
}

function toAdvancedCodeChallengeReferenceFile(
  rootFolder,
  referenceFilePathToId
) {
  return (treeNode) => {
    const contents = fs.readFileSync(treeNode.path).toString();
    const path = treeNode.path.replace(`${rootFolder}/`, "");
    return {
      id: referenceFilePathToId[path],
      $type: "AdvancedCodeChallengeReferenceFile",
      path,
      contents,
      directory: false,
    };
  };
}

function toAdvancedCodeChallengeFile(rootFolder, filePathToId, authorooJson) {
  return (treeNode) => {
    const path = treeNode.path.replace(`${rootFolder}/`, "");
    const contents = fs.readFileSync(treeNode.path).toString();
    const authorooSettings = authorooJson.files.find(
      (file) => file.path === path
    ) || {
      access: readOnlyPath.test(path) ? "readonly" : "readwrite",
    };
    return {
      id: filePathToId[path],
      $type: "AdvancedCodeChallengeFile",
      deletable: false,
      includeOnTest: true,
      includeOnSubmit: true,
      accessLocked: false,
      ...authorooSettings,
      path,
      contents,
      directory: false,
    };
  };
}

module.exports = readChallengeFolder;
