const fs = require("fs");
const path = require("path");
const fetchAssessment = require("../fetch-assessment");
const fetchChallenge = require("../fetch-challenge");

const debug = require("../debug")(__dirname, __filename);

/**
 * Needs refactoring to single responsibility
 * @param assessmentId
 *  the id of the assessment to save
 * @param checkpointFolder
 *  the target folder for the checkpoint
 * @param qualifiedApiKey
 *  the qualified API key
 * @param checkpoint
 *  the name of the checkpoint
 * @param port
 *  the port to expose in dockerfile
 * @returns {Promise<any>}
 *  the first challenge in the assessment.
 */
async function writeAssessmentAndChallenge(
  assessmentId,
  checkpointFolder,
  qualifiedApiKey,
  checkpoint,
  port
) {
  console.log(`Fetching assessment and challenge.`);

  const authorooFile = path.join(checkpointFolder, "authoroo.json");

  if (fs.existsSync(authorooFile) === false) {
    fs.writeFileSync(authorooFile, JSON.stringify({ challenges: [] }, null, 4));
  }

  const fetchedAssessment = await fetchAssessment(
    qualifiedApiKey,
    assessmentId
  );

  const assessmentFile = path.join(checkpointFolder, "assessment.json");

  fs.writeFileSync(assessmentFile, JSON.stringify(fetchedAssessment, null, 4));

  const challengeItems = fetchedAssessment.data.challengeItems || [];

  if (challengeItems.length === 0) {
    throw new Error(`Error assessment has zero challenge items.`);
  }

  if (challengeItems.length === 1) {
    const challengeId = challengeItems[0].challengeId;

    const fetchedChallenge = await fetchChallenge(qualifiedApiKey, challengeId);

    const challengeFile = path.join(checkpointFolder, "challenge.json");

    fs.writeFileSync(challengeFile, JSON.stringify(fetchedChallenge, null, 4));

    const existingConfig = fs.existsSync(authorooFile)
      ? JSON.parse(fs.readFileSync(authorooFile).toString())
      : {};

    const updatedConfig = toConfig(checkpoint, fetchedChallenge.data, port);

    const authorooJson = {
      ...existingConfig,
      ...updatedConfig,
    };

    debug("authorooJson", authorooJson, authorooFile);

    fs.writeFileSync(authorooFile, JSON.stringify(authorooJson, null, 4));

    return fetchedChallenge;
  }

  return Promise.all(
    challengeItems.map(async (challengeItem) => {
      const fetchedChallenge = await fetchChallenge(
        qualifiedApiKey,
        challengeItem.challengeId
      );

      const authorooJson = JSON.parse(fs.readFileSync(authorooFile).toString());

      let challengeConfig = authorooJson.challenges.find(
        (authorooJsonChallenge) =>
          authorooJsonChallenge.id === challengeItem.challengeId
      );

      if (!challengeConfig) {
        challengeConfig = toMultiConfig(checkpoint, fetchedChallenge.data);

        authorooJson.challenges = authorooJson.challenges
          ? authorooJson.challenges.concat(challengeConfig)
          : [challengeConfig];

        fs.writeFileSync(authorooFile, JSON.stringify(authorooJson, null, 4));
      }

      const challengeFile = path.join(
        checkpointFolder,
        `challenge.${challengeConfig.folder}.json`
      );
      fs.writeFileSync(
        challengeFile,
        JSON.stringify(fetchedChallenge, null, 4)
      );
      return fetchedChallenge;
    })
  );
}

function toMultiConfig(checkpoint, challenge) {
  const folder = challenge.title
    .toLowerCase()
    .replace(/[\W_]+/g, "")
    .substring(0, 115);

  const result = toConfig(checkpoint, challenge);
  result.folder = folder;
  return result;
}

function toConfig(checkpoint, challenge) {
  return {
    id: challenge.id,
    files: challenge.files.map((file) => ({
      path: file.path,
      access: file.access,
    })),
  };
}

module.exports = writeAssessmentAndChallenge;
