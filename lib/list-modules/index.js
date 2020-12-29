const fs = require("fs");
const path = require("path");

async function listModules(webDevPath) {
  return fs.promises
    .readdir(path.join(webDevPath, "modules"))
    .then((files) => files.filter((file) => file.startsWith("zid-")))
    .then((files) => files.map((file) => path.join("modules", file)));
}

module.exports = listModules;
