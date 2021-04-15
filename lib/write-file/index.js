const fs = require("fs");
const path = require("path");

const debug = require("../debug")(__dirname, __filename);

function writeFile(destinationFolder) {
  return (file) => {
    const filePath = path.join(destinationFolder, file.path);
    const folder = path.dirname(filePath);

    debug("write file", file.path, folder, filePath);

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    fs.writeFileSync(filePath, file.contents);
    return file;
  };
}

module.exports = writeFile;
