const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const fetchAssessment = require("../fetch-assessment");

const debug = require("../debug")(__dirname, __filename);

async function saveChallengeItem(
  checkpointFolder,
  assessmentId,
  challengeId,
  checkpoint,
  qualifiedApiKey
) {
  debug(
    checkpointFolder,
    assessmentId,
    challengeId,
    checkpoint,
    qualifiedApiKey
  );

  const headers = {
    Authorization: qualifiedApiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const assessmentFile = path.join(checkpointFolder, "assessment.json");

  const challengeItemUrl = `https://www.qualified.io/api/v1/assessments/${assessmentId}/challenge_items/`;
  const method = "POST";

  const challengeItem = {
    data: {
      challenge_id: challengeId,
    },
  };

  const challengeItemFetchOptions = {
    method,
    headers,
    body: JSON.stringify(challengeItem),
  };

  debug(
    method,
    challengeItemUrl,
    headers,
    JSON.stringify(challengeItem, null, 4)
  );

  const challengeItemResponse = await fetch(
    challengeItemUrl,
    challengeItemFetchOptions
  );

  // 409 conflict may happen if the challenge item is already on the assessment
  if (challengeItemResponse.status !== 409 && !challengeItemResponse.ok) {
    const challengeItemResponseText = await challengeItemResponse.text();
    throw new Error(
      `Error adding challenge to assessment. You should add the challenge manually.: ${checkpoint} - ${challengeItemResponse.statusText} - ${challengeItemResponseText}`
    );
  }

  const savedChallengeItem = await challengeItemResponse.json();

  debug(JSON.stringify(savedChallengeItem, null, 4));
}

module.exports = saveChallengeItem;
