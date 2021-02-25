const directoryTree = require("directory-tree");
const path = require("path");
const fs = require("fs");

const debug = require("debug")("authoroo:assessment:readQualifiedFolder");

function readQualifiedFolder(folder, filePathToId, referenceFilePathToId) {
  const solutionFolder = path.join(folder, "solution");

  debug(folder, filePathToId, referenceFilePathToId, solutionFolder);

  const files = directoryTree(folder, {
    exclude: [
      /\.dockerignore/,
      /\.DS_Store/,
      /\.env/,
      /\.env\..*/,
      /\.gitignore/,
      /\.gitkeep/,
      /\.idea/,
      /\.vscode/,
      /\.(gif|jpe?g|tiff?|png|webp|bmp|ico)$/i,
      /Dockerfile/,
      /node_modules/,
      /package-lock.json/,
      /readme.md/i,
      new RegExp(solutionFolder),
    ],
  })
    .children.flatMap(theChildren)
    .filter((treeNode) => treeNode.type !== "directory")
    .map(toAdvancedCodeChallengeFile(folder, filePathToId));

  const referenceFiles = directoryTree(solutionFolder, {
    exclude: [/.gitkeep/, /.DS_Store/, /Dockerfile/i],
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

function toAdvancedCodeChallengeFile(rootFolder, filePathToId) {
  return (treeNode) => {
    const path = treeNode.path.replace(`${rootFolder}/`, "");
    const contents = fs.readFileSync(treeNode.path).toString();
    return {
      id: filePathToId[path],
      $type: "AdvancedCodeChallengeFile",
      deletable: false,
      access: rootFolder.startsWith("test") ? "readonly" : "readwrite",
      includeOnTest: true,
      includeOnSubmit: true,
      accessLocked: false,
      path,
      contents,
      directory: false,
    };
  };
}

module.exports = readQualifiedFolder;
