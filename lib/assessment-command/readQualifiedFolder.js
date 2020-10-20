const directoryTree = require("directory-tree");
const path = require("path");
const fs = require("fs");

function readQualifiedFolder(folder) {
  const solutionFolder = path.join(folder, "solution");

  const files = directoryTree(folder, {
    exclude: [
      /node_modules/,
      /.gitkeep/,
      /readme.md/i,
      /package-lock.json/,
      /.gitkeep/,
      new RegExp(solutionFolder),
    ],
  })
    .children.flatMap(theChildren)
    .map(toAdvancedCodeChallengeFile(folder));

  const referenceFiles = directoryTree(solutionFolder, {
    exclude: [/.gitkeep/],
  })
    .children.flatMap(theChildren)
    .map(toAdvancedCodeChallengeReferenceFile(solutionFolder));

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

function toAdvancedCodeChallengeReferenceFile(rootFolder) {
  return (treeNode) => {
    const directory = treeNode.type === "directory";
    const contents = directory ? "" : fs.readFileSync(treeNode.path).toString();

    return {
      $type: "AdvancedCodeChallengeReferenceFile",
      path: treeNode.path.replace(`${rootFolder}/`, ""),
      contents,
      directory,
    };
  };
}

function toAdvancedCodeChallengeFile(rootFolder) {
  return (treeNode) => {
    const path = treeNode.path.replace(`${rootFolder}/`, "");
    const directory = treeNode.type === "directory";
    const contents = directory
      ? null
      : fs.readFileSync(treeNode.path).toString();
    return {
      $type: "AdvancedCodeChallengeFile",
      deletable: true,
      initialLayout: null,
      excludeSimilarity: false,
      access: path.startsWith("test") ? "readonly" : "readwrite",
      includeOnTest: true,
      includeOnSubmit: true,
      accessLocked: false,
      path,
      contents,
      directory,
    };
  };
}
module.exports = readQualifiedFolder;
