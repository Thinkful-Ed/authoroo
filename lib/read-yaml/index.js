const fs = require("fs");
const yaml = require("js-yaml");

async function readYaml(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (error, data) => {
      if (error) {
        return reject(error);
      }
      resolve(yaml.load(data.toString()));
    });
  });
}

module.exports = readYaml;
