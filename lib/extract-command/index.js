const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const selectCheckpoint = require("../select-checkpoint");
const inquirer = require("inquirer");

const command = "extract";
const describe =
  "Prompts for zid module and checkpoint, then extracts the files from the qualified challenge into the checkpoint directory.";

function builder(yargs) {
  return yargs.config()
  .option("q", {
    alias: "qualifiedApiKey",
    demandOption: true,
    describe:
      "Qualified API access key copied from https://www.qualified.io/hire/account/integrations#api-key.",
    nargs: 1,
    type: "string",
  });
}

async function handler(config) {
  const checkpoint = await selectCheckpoint(config.webDevPath);

  const checkpointFolder = path.join(config.webDevPath, "library", checkpoint);
  const qualifiedFolder = path.join(checkpointFolder, "qualified");
  const solutionFolder = path.join(qualifiedFolder, "solution");

  const challengeFile = path.join(checkpointFolder, "challenge.json");

  if (fs.existsSync(challengeFile)) {
    console.log(
      `Extracting challenge id from existing challenge.json: ${challengeFile}`
    );
  } else {
    const questions = [
      {
        type: "input",
        name: "assessmentId",
        message: "What is the assessment id?",
      },
    ];
    const assessmentId = await inquirer
      .prompt(questions)
      .then((answers) => answers.assessmentId);

    const headers = {
      Authorization: config.qualifiedApiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    console.log(
      `Fecching assessment and challenge API.`
    );

    const assessmentResponse = await fetch(
      `https://www.qualified.io/api/v1/assessments/${assessmentId}`,
      {
        headers,
      }
    );

    if (!assessmentResponse.ok) {
      const assessmentResponseText = await assessmentResponse.text();
      throw new Error(
        `Error getting assessment: ${assessmentId} - ${assessmentResponse.statusText} - ${assessmentResponseText}`
      );
    }

    const assessment = await assessmentResponse.json();

    const assessmentFile = path.join(checkpointFolder, "assessment.json");

    fs.writeFileSync(assessmentFile, JSON.stringify(assessment, null, 4));

    if (assessment.data.challengeItems.length === 0) {
      throw new Error(`Error assessment has zero challenge items.`);
    }

    const challengeId = assessment.data.challengeItems[0].challengeId;

    const challengeResponse = await fetch(
      `https://www.qualified.io/api/v1/challenges/${challengeId}`,
      {
        headers,
      }
    );

    if (!challengeResponse.ok) {
      const challengeResponseText = await challengeResponse.text();
      throw new Error(
        `Error getting challenge: ${challengeId} - ${challengeResponse.statusText} - ${challengeResponseText}`
      );
    }

    const fetchedChallenge = await challengeResponse.json();

    fs.writeFileSync(challengeFile, JSON.stringify(fetchedChallenge, null, 4));
  }

  const challenge = require(challengeFile);

  challenge.data.files
    .filter((file) => !file.directory)
    .forEach(writeFile(qualifiedFolder, config));

  challenge.data.referenceFiles
    .filter((file) => !file.directory)
    .forEach(writeFile(solutionFolder, config));


    fs.writeFileSync(path.join(qualifiedFolder, "README.md"), challenge.data.instructions);

  console.log("Done");
}

function writeFile(destinationFolder, config) {
  return (file) => {
    const filePath = path.join(destinationFolder, file.path);
    const folder = path.dirname(filePath);
    if (config.debug) {
      console.log("reference file", file.path, folder, filePath);
    }
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

