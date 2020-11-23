const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

const assessmentTemplate = require("./assessment.json");

async function saveAssessment(
  checkpoint,
  checkpointFolder,
  savedChallenge,
  debug,
  headers
) {
  const assessmentFile = path.join(checkpointFolder, "assessment.json");

  const assessment = fs.existsSync(assessmentFile)
    ? require(assessmentFile)
    : JSON.parse(JSON.stringify(assessmentTemplate));

  if (assessment.data.id) {
    console.log(
      `Skipping assessment creation. Assessment already exists: https://www.qualified.io/api/v1/assessments/${assessment.data.id}`
    );
    return assessment;
  }

  assessment.data.title = savedChallenge.data.title;
  assessment.data.labels = savedChallenge.data.labels;
  assessment.data.state = "draft";
  assessment.challenge_items = [
    {
      challengeId: savedChallenge.data.id,
      position: 1,
      disabledLanguages: [],
    },
  ];

  const assessmentFetchOptions = {
    method: "POST",
    body: JSON.stringify(assessment),
    headers,
  };

  if (debug) {
    console.debug(JSON.stringify(assessment, null, 4));
  }

  const assessmentsUrl = "https://www.qualified.io/api/v1/assessments";
  const assessmentResponse = await fetch(
    assessmentsUrl,
    assessmentFetchOptions
  );

  if (!assessmentResponse.ok) {
    const assessmentResponseText = await assessmentResponse.text();
    throw new Error(
      `Error creating assessment: ${checkpoint} - ${
        assessmentResponse.statusText
      } - ${JSON.stringify(assessmentResponseText)}`
    );
  }

  const savedAssessment = await assessmentResponse.json();

  if (debug) {
    console.debug("savedAssessment", JSON.stringify(savedAssessment, null, 4));
  }

  fs.writeFileSync(assessmentFile, JSON.stringify(savedAssessment, null, 4));

  return savedAssessment;
}

module.exports = saveAssessment;
