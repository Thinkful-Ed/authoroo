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
    return authorooJson.challenges.reduce(
      (previousPromise, challengeConfig) => {
        const challengeFile = path.join(
          checkpointFolder,
          `challenge.${challengeConfig.folder}.json`
        );

        const existingChallenge = readJson(challengeFile, { data: {} });

        return previousPromise.then((challenges) => {
          return challengeOptions(
            existingChallenge.data,
            challengeConfig.folder
          )
            .then((options) =>
              saveChallenge(
                qualifiedApiKey,
                challengeFile,
                challengeConfig,
                path.join(
                  checkpointFolder,
                  "qualified",
                  challengeConfig.folder
                ),
                checkpoint,
                options
              )
            )
            .then((challenge) => challenges.concat(challenge));
        });
      },
      Promise.resolve([])
    );
  } else {
    const challengeFile = path.join(checkpointFolder, "challenge.json");
    const qualifiedFolder = path.join(checkpointFolder, "qualified");

    const existingChallenge = readJson(challengeFile, { data: {} });

    return challengeOptions(
      existingChallenge.data,
      authorooJson.folder
    ).then((options) =>
      saveChallenge(
        qualifiedApiKey,
        challengeFile,
        authorooJson,
        qualifiedFolder,
        checkpoint,
        options
      ).then((savedChallenge) => [savedChallenge])
    );
  }
}

module.exports = saveChallenges;
