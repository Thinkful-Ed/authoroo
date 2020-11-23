const fetch = require("node-fetch");

async function fetchAssessment(qualifiedApiKey, assessmentId) {
  const headers = {
    Authorization: qualifiedApiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const assessmentResponse = await fetch(
    `https://www.qualified.io/api/v1/assessments/${assessmentId}`,
    {
      headers,
    }
  );

  if (!assessmentResponse.ok) {
    const assessmentResponseText = await assessmentResponse.text();
    throw new Error(
      `Error getting assessment: ${assessmentId} - ${assessmentResponse.statusText} - ${assessmentResponseText}`
    );
  }

  return await assessmentResponse.json();
}

module.exports = fetchAssessment;
