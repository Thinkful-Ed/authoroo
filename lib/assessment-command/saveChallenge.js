const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const { capitalCase } = require("capital-case");

const challengeTemplate = require("./challenge.json");
const readQualifiedFolder = require("./readQualifiedFolder");

const findPhaseLabel = /^zid-([a-zA-Z]*)/;

async function saveChallenge(
  checkpoint,
  checkpointFolder,
  moduleName,
  moduleCode,
  options,
  debug,
  headers
) {
  const qualifiedFolder = path.join(checkpointFolder, "qualified");

  if (!fs.existsSync(qualifiedFolder)) {
    throw new Error(`Qualified folder not found: ${qualifiedFolder}`);
  }

  const challengeFile = path.join(checkpointFolder, "challenge.json");

  const challenge = fs.existsSync(challengeFile)
    ? require(challengeFile)
    : JSON.parse(JSON.stringify(challengeTemplate));

  const checkpointName = capitalCase(
    checkpoint
      .replace(`${moduleCode}-`, "")
      .replace(/^\d\d-/, "")
      .replace(/^XX-/i, "")
  );

  const phaseLabel = moduleCode.match(findPhaseLabel)[1] || moduleCode;

  challenge.data.title = `${moduleName}: ${checkpointName}`;
  challenge.data.topics = [checkpoint];
  challenge.data.labels = [`Phase: ${phaseLabel}`, `Module: ${moduleName}`];

  Object.entries(options).forEach(
    ([key, value]) => (challenge.data[key] = value)
  );

  const folderInfo = readQualifiedFolder(qualifiedFolder);

  Object.entries(folderInfo).forEach(
    ([key, value]) => (challenge.data[key] = value)
  );

  const challengeUrl = challenge.data.id
    ? `https://www.qualified.io/api/v1/advanced_code_challenges/${challenge.data.id}`
    : "https://www.qualified.io/api/v1/advanced_code_challenges";
  const method = challenge.data.id ? "PUT" : "POST";
  const body = JSON.stringify(challenge);

  const challengeFetchOptions = {
    method,
    body,
    headers,
  };

  if (debug) {
    console.log(challengeUrl);
    console.log(JSON.stringify(challenge, null, 4));
  }

  // TODO: Remove the following once Qualified fixes PUT operations
  if (challenge.data.id) {
    throw new Error(
      `Unable to update existing challenge: https://www.qualified.io/api/v1/challenges/${challenge.data.id}`
    );
  }

  const challengeResponse = await fetch(challengeUrl, challengeFetchOptions);

  if (!challengeResponse.ok) {
    const challengeResponseText = await challengeResponse.text();
    throw new Error(
      `Error updating challenge: ${checkpoint} - ${challengeResponse.statusText} - ${challengeResponseText}`
    );
  }

  const savedChallenge = await challengeResponse.json();

  fs.writeFileSync(challengeFile, JSON.stringify(savedChallenge, null, 4));

  return savedChallenge;
}

module.exports = saveChallenge;
