const path = require("path");

function debug(folderName, fileName) {
  return require("debug")(
    `authoroo${fileName
      .replace(path.resolve(folderName, "..", ".."), "")
      .replace(new RegExp(path.sep, "g"), ":")}`
  );
}

module.exports = debug;
