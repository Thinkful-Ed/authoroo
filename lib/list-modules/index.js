const fs = require("fs");
const path = require("path");

async function listModules(webDevPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(path.join(webDevPath, "modules"), (error, files) => {
      if (error) {
        return reject(error);
      }
      resolve(
        files
          .filter((file) => file.startsWith("zid-"))
          .map((file) => path.join("modules", file))
      );
    });
  });
}

module.exports = listModules;
