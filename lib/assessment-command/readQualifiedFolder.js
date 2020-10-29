const directoryTree = require("directory-tree");
const path = require("path");
const fs = require("fs");

function readQualifiedFolder(folder) {
  const solutionFolder = path.join(folder, "solution");

  const files = directoryTree(folder, {
    exclude: [
      /node_modules/,
      /.gitignore/,
      /.gitkeep/,
      /readme.md/i,
      /package-lock.json/,
      /.idea/,
      /.vscode/,
      /\.(gif|jpe?g|tiff?|png|webp|bmp|ico)$/i,
      new RegExp(solutionFolder),
    ],
  })
    .children.flatMap(theChildren)
    .filter((treeNode) => treeNode.type !== "directory")
    .map(toAdvancedCodeChallengeFile(folder));

  const referenceFiles = directoryTree(solutionFolder, {
    exclude: [/.gitkeep/],
  })
    .children.flatMap(theChildren)
    .filter((treeNode) => treeNode.type !== "directory")
    .map(toAdvancedCodeChallengeReferenceFile(solutionFolder));

  const instructions = fs
    .readFileSync(path.join(folder, "README.md"))
    .toString();

  return {
    instructions,
    files,
    // referenceFiles,
  };
}

function theChildren(node) {
  const { children = [], ...nodeSansChildren } = node;
  return [nodeSansChildren].concat(children.flatMap(theChildren));
}

function toAdvancedCodeChallengeReferenceFile(rootFolder) {
  return (treeNode) => {
    const contents = fs.readFileSync(treeNode.path).toString();

    return {
      $type: "AdvancedCodeChallengeReferenceFile",
      path: treeNode.path.replace(`${rootFolder}/`, ""),
      contents,
      directory: false,
    };
  };
}

function toAdvancedCodeChallengeFile(rootFolder) {
  return (treeNode) => {
    const path = treeNode.path.replace(`${rootFolder}/`, "");
    const contents = fs.readFileSync(treeNode.path).toString();
    return {
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
