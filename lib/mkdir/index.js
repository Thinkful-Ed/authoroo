const fs = require("fs");

async function mkdir(path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (error) => {
      if (error) {
        return reject(error);
      }
      resolve(path);
    });
  });
}

module.exports = mkdir;
