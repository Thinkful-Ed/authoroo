const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const fetchAssessment = require("../fetch-assessment");
const debug = require("debug")("authoroo:assessment:saveChallengeItem");

async function saveChallengeItem(
  checkpointFolder,
  assessmentId,
  challengeId,
  checkpoint,
  headers,
  qualifiedApiKey
) {
  const assessmentFile = path.join(checkpointFolder, "assessment.json");

  const savedAssessment = await fetchAssessment(qualifiedApiKey, assessmentId);

  if ((savedAssessment.data.challengeItems || []).length > 0) {
    // Writing assessment.json here just in case it is out-of-date,
    // and it will be out-of-date for any assessments created before the Qualified API was fixed
    fs.writeFileSync(assessmentFile, JSON.stringify(savedAssessment, null, 4));
    console.log(
      `Skipping challenge item creation. Assessment already contains challenge items: https://www.qualified.io/api/v1/assessments/${savedAssessment.data.id}`
    );
    return savedAssessment.data.challengeItems[0];
  }

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

  if (!challengeItemResponse.ok) {
    const challengeItemResponseText = await challengeItemResponse.text();
    throw new Error(
      `Error adding challenge to assessment. You should add the challenge manually.: ${checkpoint} - ${challengeItemResponse.statusText} - ${challengeItemResponseText}`
    );
  }

  const savedChallengeItem = await challengeItemResponse.json();

  debug(JSON.stringify(savedChallengeItem, null, 4));

  const updatedAssessment = await fetchAssessment(
    qualifiedApiKey,
    savedAssessment.data.id
  );
  fs.writeFileSync(assessmentFile, JSON.stringify(updatedAssessment, null, 4));

  return savedChallengeItem;
}

module.exports = saveChallengeItem;