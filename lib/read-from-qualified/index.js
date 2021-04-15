const fetch = require("node-fetch");

async function readFromQualified(qualifiedApiKey, resource, id) {
  const headers = {
    Authorization: qualifiedApiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const response = await fetch(
    `https://www.qualified.io/api/v1/${resource}/${id}`,
    { headers }
  );

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Error getting resource: ${resource} - ${response.statusText} - ${responseText}`
    );
  }

  return await response.json();
}

module.exports = readFromQualified;
