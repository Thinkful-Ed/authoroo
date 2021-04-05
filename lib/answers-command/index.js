const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const fetchAssessment = require("../fetch-assessment");

const command = "answers <assessment-id>";
const describe = "Generates answer keys for the specified assessment";

function builder(yargs) {
  return yargs
    .option("q", {
      alias: "qualifiedApiKey",
      demandOption: true,
      describe:
        "Qualified API access key copied from https://www.qualified.io/hire/account/integrations#api-key.",
      nargs: 1,
      type: "string",
    })
    .positional("a", {
      alias: "assessment-id",
      demandOption: true,
      type: "string",
      describe: "the id of the assessment",
    });
}

async function handler(config) {
  const fetchOptions = {
    headers: {
      Authorization: config.qualifiedApiKey,
    },
  };

  const assessment = await fetchAssessment(
    config.qualifiedApiKey,
    config.assessmentId
  );

  const challenges = await Promise.all(
    assessment.data.challengeItems.map((challengeItem) => {
      return fetch(
        `https://www.qualified.io/api/v1/challenges/${challengeItem.challengeId}`,
        fetchOptions
      ).then((response) => response.json());
    })
  );

  const quizzes = challenges
    .filter((challenge) => challenge.type === "QuizChallenge")
    .map((challenge) => {
      challenge.data.questions.sort(byPosition);
      return challenge.data;
    });

  const answersTemplate = Handlebars.compile(
    fs
      .readFileSync(path.join(__dirname, "answers.handlebars"), "utf8")
      .toString()
  );

  const content = answersTemplate({ quizzes });

  console.log(content);
}

function byPosition(left, right) {
  return left.position - right.position;
}

module.exports = {
  command,
  describe,
  builder,
  handler,
};
