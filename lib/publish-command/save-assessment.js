const path = require("path");
const fs = require("fs");

const debug = require("../debug")(__dirname, __filename);

const assessmentTemplate = require("./assessment.json");
const saveToQualified = require("../save-to-qualified");

async function saveAssessment(
  checkpoint,
  checkpointFolder,
  title,
  labels,
  qualifiedApiKey
) {
  debug(checkpoint, checkpointFolder, title, labels, qualifiedApiKey);

  const assessmentFile = path.join(checkpointFolder, "assessment.json");

  const assessment = fs.existsSync(assessmentFile)
    ? JSON.parse(fs.readFileSync(assessmentFile).toString())
    : JSON.parse(JSON.stringify(assessmentTemplate));

  debug(assessment);

  if (assessment.data.id) {
    console.log(
      `Skipping assessment creation. Assessment already exists: https://www.qualified.io/api/v1/assessments/${assessment.data.id}`
    );
    return assessment;
  }

  assessment.data.title = title || checkpointFolder;
  assessment.data.labels = labels || [checkpointFolder];
  assessment.data.state = "draft";

  const savedAssessment = await saveToQualified(
    qualifiedApiKey,
    assessment.data,
    "assessments"
  );

  debug("savedAssessment", savedAssessment);

  fs.writeFileSync(assessmentFile, JSON.stringify(savedAssessment, null, 4));

  return savedAssessment;
}

module.exports = saveAssessment;
