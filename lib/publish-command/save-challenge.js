const challengeOptions = require("../challenge-options");
const readChallengeFolder = require("../read-challenge-folder");
const fs = require("fs");
const saveToQualified = require("../save-to-qualified");
const { capitalCase } = require("capital-case");

const debug = require("../debug")(__dirname, __filename);

/**
 *
 * @param qualifiedApiKey
 * @param challengeFile
 * @param authorooJson
 * @param challengeFolder
 * @param checkpoint
 * @returns {Promise<challenge>}
 */
async function saveChallenge(
  qualifiedApiKey,
  challengeFile,
  authorooJson,
  challengeFolder,
  checkpoint,
  options
) {
  debug(
    qualifiedApiKey,
    challengeFile,
    authorooJson,
    challengeFolder,
    checkpoint,
    options,
  );

  const existingChallenge = fs.existsSync(challengeFile)
    ? JSON.parse(fs.readFileSync(challengeFile).toString())
    : { data: {} };

  const filePathToId = (existingChallenge.data.files || []).reduce(
    (accumulator, file) => {
      accumulator[file.path] = file.id;
      return accumulator;
    },
    {}
  );

  const referenceFilePathToId = (
    existingChallenge.data.referenceFiles || []
  ).reduce((accumulator, file) => {
    accumulator[file.path] = file.id;
    return accumulator;
  }, {});

  const folderInfo = readChallengeFolder(
    authorooJson,
    challengeFolder,
    filePathToId,
    referenceFilePathToId
  );

  const title =
    authorooJson.title ||
    existingChallenge.data.title ||
    capitalCase(
      checkpoint
        .replace(/zid-([a-zA-Z]*)-/, "")
        .replace(/^\d\d-/, "")
        .replace(/^XX-/i, "")
    );

  const data = {
    id: existingChallenge.data.id,
    title,
    topics: authorooJson.topics ||
      existingChallenge.data.topics || [checkpoint],
    labels: authorooJson.labels ||
      existingChallenge.data.labels || [checkpoint],
    ...options,
    ...folderInfo,
    submissionFeedback: true,
  };

  debug("data", data);

  const savedChallenge = await saveToQualified(
    qualifiedApiKey,
    "advanced_code_challenges",
    data
  );

  fs.writeFileSync(challengeFile, JSON.stringify(savedChallenge, null, 4));

  return Promise.resolve(savedChallenge);
}

module.exports = saveChallenge;
