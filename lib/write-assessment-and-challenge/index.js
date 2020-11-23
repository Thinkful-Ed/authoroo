const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const fetchAssessment = require("../fetch-assessment");
const fetchChallenge = require("../fetch-challenge");

/**
 * Needs refactoring to single responsibility
 * @param assessmentId
 *  the id of the assessment to save
 * @param checkpointFolder
 *  the target folder for the checkpoint
 * @param qualifiedApiKey
 *  the qualified API key
 * @returns {Promise<any>}
 *  the first challenge in the assessment.
 */
async function writeAssessmentAndChallenge(
  assessmentId,
  checkpointFolder,
  qualifiedApiKey
) {
  console.log(`Fetching assessment and challenge.`);

  const fetchedAssessment = await fetchAssessment(
    qualifiedApiKey,
    assessmentId
  );

  const assessmentFile = path.join(checkpointFolder, "assessment.json");

  fs.writeFileSync(assessmentFile, JSON.stringify(fetchedAssessment, null, 4));

  if ((fetchedAssessment.data.challengeItems || []).length === 0) {
    throw new Error(`Error assessment has zero challenge items.`);
  }

  const challengeId = fetchedAssessment.data.challengeItems[0].challengeId;

  const fetchedChallenge = await fetchChallenge(qualifiedApiKey, challengeId);

  const challengeFile = path.join(checkpointFolder, "challenge.json");
  fs.writeFileSync(challengeFile, JSON.stringify(fetchedChallenge, null, 4));

  return fetchedChallenge;
}

module.exports = writeAssessmentAndChallenge;
