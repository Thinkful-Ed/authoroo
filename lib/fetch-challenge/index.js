const fetch = require("node-fetch");

async function fetchChallenge(qualifiedApiKey, challengeId) {
  const headers = {
    Authorization: qualifiedApiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const challengeResponse = await fetch(
    `https://www.qualified.io/api/v1/challenges/${challengeId}`,
    {
      headers,
    }
  );

  if (!challengeResponse.ok) {
    const challengeResponseText = await challengeResponse.text();
    throw new Error(
      `Error getting challenge: ${challengeId} - ${challengeResponse.statusText} - ${challengeResponseText}`
    );
  }

  return await challengeResponse.json();
}

module.exports = fetchChallenge;
