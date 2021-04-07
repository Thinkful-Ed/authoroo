const fs = require("fs");

function readJson(path, defaultIfNotExists) {
  return fs.existsSync(path)
    ? JSON.parse(fs.readFileSync(path).toString())
    : defaultIfNotExists;
}

module.exports = readJson;
