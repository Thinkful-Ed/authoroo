const fetch = require("node-fetch");
const { capitalCase } = require("capital-case");
const debug = require("debug")("authoroo:assessment:saveChallenge");

const findPhaseLabel = /^zid-([a-zA-Z]*)/;

async function saveChallenge(
  challengeId,
  qualifiedFolder,
  checkpoint,
  moduleName,
  moduleCode,
  options,
  headers,
  folderInfo
) {
  debug(
    challengeId,
    qualifiedFolder,
    checkpoint,
    moduleName,
    moduleCode,
    options,
    headers
  );

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

  debug("Extracting phaseLabel", moduleCode, findPhaseLabel);

  const phaseLabel = (moduleCode.match(findPhaseLabel) || [])[1] || moduleCode;

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

  debug(method, challengeUrl, headers);
  debug("challenge", challenge);

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
