const fs = require("fs");

async function writeFile(path, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, (error) => {
      if (error) {
        return reject(error);
      }
      resolve(content);
    });
  });
}

module.exports = writeFile;
