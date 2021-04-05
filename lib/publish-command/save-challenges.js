const path = require("path");
const saveChallenge = require("./save-challenge");
const readJson = require("../read-json");
const challengeOptions = require("../challenge-options");

/**
 *
 * @param qualifiedApiKey
 * @param checkpoint
 * @param checkpointFolder
 * @param authorooJson
 * @returns {Promise<[T]>}
 */
async function saveChallenges(
  qualifiedApiKey,
  checkpoint,
  checkpointFolder,
  authorooJson
) {
  if (authorooJson.challenges) {
    return Promise.all(
      authorooJson.challenges.map((challengeConfig) => {
        const challengeFile = path.join(
          checkpointFolder,
          `challenge.${challengeConfig.folder}.json`
        );

        const existingChallenge = readJson(challengeFile, { data: {} });

        return challengeOptions(
          existingChallenge.data,
          challengeConfig.folder
        ).then((options) =>
          saveChallenge(
            qualifiedApiKey,
            challengeFile,
            challengeConfig,
            challengeFolder,
            checkpoint,
            options
          )
        );
      })
    );
  } else {
    const challengeFile = path.join(checkpointFolder, "challenge.json");
    const qualifiedFolder = path.join(checkpointFolder, "qualified");

    const existingChallenge = readJson(challengeFile, { data: {} });

    return challengeOptions(
      existingChallenge.data,
      authorooJson.folder
    ).then((options) => saveChallenge(
      qualifiedApiKey,
      challengeFile,
      authorooJson,
      qualifiedFolder,
      checkpoint
    ).then((savedChallenge) => [savedChallenge]));
  }
}

module.exports = saveChallenges;
