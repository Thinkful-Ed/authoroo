const fetch = require("node-fetch");

const debug = require("../debug")(__dirname, __filename);

async function saveToQualified(qualifiedApiKey, resource, data) {
  const headers = {
    Authorization: qualifiedApiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  debug(data, headers);

  const challengeUrl = data.id
    ? `https://www.qualified.io/api/v1/${resource}/${data.id}`
    : `https://www.qualified.io/api/v1/${resource}`;

  const method = data.id ? "PUT" : "POST";

  const challengeFetchOptions = {
    method,
    headers,
    body: JSON.stringify({ data }),
  };

  debug(method, challengeUrl, headers);
  debug("data", data);

  const response = await fetch(challengeUrl, challengeFetchOptions);

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Error updating challenge: ${method} TO ${resource} - ${response.statusText} - ${responseText}`
    );
  }

  return await response.json();
}

module.exports = saveToQualified;
