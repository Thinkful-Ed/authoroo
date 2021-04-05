const fetch = require("node-fetch");
const debug = require("../debug")(__dirname, __filename);

async function uploadChallenge(config, existingChallenge, folderInfo) {
  debug(config, existingChallenge, folderInfo);

  const challengeUrl = `https://www.qualified.io/api/v1/advanced_code_challenges/${existingChallenge.data.id}`;

  const method = "PUT";

  const challenge = {
    data: {
      ...existingChallenge.data,
      ...folderInfo,
      submissionFeedback: true,
    },
  };

  const headers = {
    Authorization: config.qualifiedApiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
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
      `Error updating challenge: ${challengeResponse.statusText} - ${challengeResponseText}`
    );
  }

  return await challengeResponse.json();
}

module.exports = uploadChallenge;
