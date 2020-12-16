const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const debug = require("debug")("authoroo:assessment:saveAssessment");

const assessmentTemplate = require("./assessment.json");

async function saveAssessment(
  checkpoint,
  checkpointFolder,
  savedChallenge,
  headers
) {
  const assessmentFile = path.join(checkpointFolder, "assessment.json");

  const assessment = fs.existsSync(assessmentFile)
    ? require(assessmentFile)
    : JSON.parse(JSON.stringify(assessmentTemplate));

  debug(assessment);

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

  const assessmentsUrl = "https://www.qualified.io/api/v1/assessments";

  debug(assessmentsUrl, assessmentFetchOptions, assessment);

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

  debug("savedAssessment", savedAssessment);

  fs.writeFileSync(assessmentFile, JSON.stringify(savedAssessment, null, 4));

  return savedAssessment;
}

module.exports = saveAssessment;
