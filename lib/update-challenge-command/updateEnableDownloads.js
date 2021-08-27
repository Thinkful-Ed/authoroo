const fs = require('fs');
const updateChallenge = require("../update-challenge-options")

function updateEnableDownloads(qualifiedApiKey, challengeJsonPath, enableFileDownloads){
    const data = {
       "$type":"AdvancedCodeChallenge",
       "enableFileDownloads": enableFileDownloads,
    };
    const challenges = JSON.parse(fs.readFileSync(challengeJsonPath));
    challenges.forEach((challenge) => {
      updateChallenge(qualifiedApiKey, challenge.challenge_id, data);
      console.log(`${challenge.module} - ${challenge.checkpoint} - ${challenge.challenge_id} - ${challenge.url}`);
    });
}

module.exports = updateEnableDownloads;
