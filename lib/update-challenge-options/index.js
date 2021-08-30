const axios = require('axios');

async function updateChallenge(qualifiedApiKey, challengeId, data) {
  const headers = {
    Authorization: qualifiedApiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const challengeResponse = await axios.put(
    `https://www.qualified.io/api/v1/challenges/${challengeId}`,
    { "data" : data },
    { "headers" : headers}
  ).catch(err => {
    console.log(err);
    }
  );

  return challengeResponse;
}

module.exports = updateChallenge;
