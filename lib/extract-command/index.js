const fs = require("fs");
const Handlebars = require("handlebars");
const inquirer = require("inquirer");
const path = require("path");

const selectCheckpoint = require("../select-checkpoint");
const writeAssessmentAndChallenge = require("../write-assessment-and-challenge");
const writeDockerFiles = require("../write-docker-files");

const debug = require("debug")("authoroo:extract");

const packageJson = `{
  "name": "{{checkpoint}}",
  "version": "1.0.0",
  "description": "{{checkpoint}} qualified challenge.",
  "main": "jest.config.js",
  "directories": {
    "doc": "docs"
  },
  "scripts": {
    "docker:build": "docker image build . -t thinkful-ed/{{checkpoint}}",
    "docker:run": "docker run --rm -it -p {{port}}:{{port}} thinkful-ed/{{checkpoint}}",
    "docker:stop": "docker stop $(docker ps -q)",
    "docker:test": "docker run -it thinkful-ed/{{checkpoint}} npm test",
    "start:solution": "npm run -it docker:build && npm run docker:run",
    "test": "jest",
    "test:solution": "npm run docker:build && npm run docker:test"
  },
  "keywords": [],
  "author": "Thinkful.com",
  "license": "UNLICENSED",
  "devDependencies": {
    "jest": "^26.6.3",
    "jest-reporter": "^1.0.1"
  }
}
`;

const questions = [
  {
    type: "input",
    name: "assessmentId",
    message: "What is the assessment id?",
  },
];

const command = "extract";
const describe =
  "Prompts for a module and checkpoint, then extracts the files from the qualified challenge into the checkpoint's `qualified` folder, overwriting any existing files. If there is an existing assessment.json file in the checkpoint, this command will use the assessmentId from the existing assessment.json file, otherwise it will prompt for the assessmentId. No files are deleted.";

function builder(yargs) {
  return yargs
    .config()
    .option("q", {
      alias: "qualifiedApiKey",
      demandOption: true,
      describe:
        "Qualified API access key copied from https://www.qualified.io/hire/account/integrations#api-key.",
      nargs: 1,
      type: "string",
    })
    .option("c", {
      alias: "checkpoint-folder",
      demandOption: false,
      type: "string",
      describe:
        "the path of the checkpoint folder inside of library (omit `./library` i.e. `<checkpoint-folder-name>`",
    })
    .option("a", {
      alias: "assessment-id",
      demandOption: false,
      type: "string",
      describe: "the id of the assessment",
    })
    .option("p", {
      alias: "docker-port",
      demandOption: false,
      type: "number",
      describe: "the port exposed by docker",
    });
}

async function handler(config) {
  const checkpoint =
    config["checkpoint-folder"] || (await selectCheckpoint(config.webDevPath));

  const checkpointFolder = path.join(config.webDevPath, "library", checkpoint);
  const qualifiedFolder = path.join(checkpointFolder, "qualified");
  const solutionFolder = path.join(qualifiedFolder, "solution");

  const assessmentFile = path.join(checkpointFolder, "assessment.json");

  const assessmentExists = fs.existsSync(assessmentFile);

  if (assessmentExists) {
    console.log(
      `Extracting assessment id from existing assessment.json: ${assessmentFile}`
    );
  }

  const assessmentId = assessmentExists
    ? require(assessmentFile).data.id
    : config["assessment-id"] ||
      (await inquirer
        .prompt(questions)
        .then((answers) => answers.assessmentId));

  const challenge = await writeAssessmentAndChallenge(
    assessmentId,
    checkpointFolder,
    config.qualifiedApiKey
  );

  (challenge.data.files || [])
    .filter((file) => !file.directory)
    .forEach(writeFile(qualifiedFolder, config));

  (challenge.data.referenceFiles || [])
    .filter((file) => !file.directory)
    .forEach(writeFile(solutionFolder, config));

  if (!fs.existsSync(qualifiedFolder)) {
    fs.mkdirSync(qualifiedFolder, { recursive: true });
  }

  fs.writeFileSync(
    path.join(qualifiedFolder, "README.md"),
    challenge.data.instructions
  );

  const moreQuestions = [
    {
      type: "number",
      name: "port",
      default: 3000,
      message:
        "Which port should the Dockerfile expose (Usually 3000 for React, 5000 for node, and 8080 for Spring boot)",
    },
  ];

  const answers = config["docker-port"]
    ? { port: config["docker-port"] }
    : await inquirer.prompt(moreQuestions);

  await writeDockerFiles(qualifiedFolder, {
    ...answers,
    checkpoint: checkpoint.toLowerCase(),
  });

  const packageJsonFile = path.join(qualifiedFolder, "package.json");

  if (!fs.existsSync(packageJson)) {
    const packageJsonTemplate = Handlebars.compile(packageJson);
    const contents = packageJsonTemplate({
      ...answers,
      checkpoint: checkpoint.toLowerCase(),
    });
    fs.writeFileSync(packageJsonFile, contents);
  }

  console.log("Done");
}

function writeFile(destinationFolder) {
  return (file) => {
    const filePath = path.join(destinationFolder, file.path);
    const folder = path.dirname(filePath);

    debug("reference file", file.path, folder, filePath);

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    fs.writeFileSync(filePath, file.contents);
  };
}

module.exports = {
  command,
  describe,
  builder,
  handler,
};
