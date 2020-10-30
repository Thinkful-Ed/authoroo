const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const { capitalCase } = require("capital-case");

const challengeTemplate = require("./challenge.json");
const readQualifiedFolder = require("./readQualifiedFolder");

const findPhaseLabel = /^zid-([a-zA-Z]*)/;

async function saveChallenge(
  challengeId,
  qualifiedFolder,
  checkpoint,
  moduleName,
  moduleCode,
  options,
  debug,
  headers,
  folderInfo
) {
  const challengeUrl = challengeId
    ? `https://www.qualified.io/api/v1/advanced_code_challenges/${challengeId}`
    : "https://www.qualified.io/api/v1/advanced_code_challenges";

  const method = challengeId ? "PUT" : "POST";

  const checkpointName = capitalCase(
    checkpoint
      .replace(`${moduleCode}-`, "")
      .replace(/^\d\d-/, "")
      .replace(/^XX-/i, "")
  );

  const title = `${moduleName}: ${checkpointName}`;
  const phaseLabel = moduleCode.match(findPhaseLabel)[1] || moduleCode;

  const challenge = {
    data: {
      title,
      topics: [checkpoint],
      labels: [`Phase: ${phaseLabel}`, `Module: ${moduleName}`],
      ...options,
      ...folderInfo,
    },
  };

  const challengeFetchOptions = {
    method,
    headers,
    body: JSON.stringify(challenge),
  };

  if (debug) {
    console.log(method, challengeUrl, headers);
    console.log(JSON.stringify(challenge, null, 4));
  }

  const challengeResponse = await fetch(challengeUrl, challengeFetchOptions);

  if (!challengeResponse.ok) {
    const challengeResponseText = await challengeResponse.text();
    throw new Error(
      `Error updating challenge: ${checkpoint} - ${challengeResponse.statusText} - ${challengeResponseText}`
    );
  }

  return await challengeResponse.json();
}

module.exports = saveChallenge;
