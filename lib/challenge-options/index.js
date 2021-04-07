const inquirer = require("inquirer");

const defaultRunConfig = {
  language: "javascript",
  languageVersion: "12.x",
  testFramework: "jest",
  preset: "react",
  envSet: null,
  webPreviews: true,
  codeTimeout: null,
  services: [],
  forbiddenPaths: [],
  submissionIgnorePaths: [],
};

/**
 * Prompts the user about various challenge options.
 */

async function challengeOptions(data, folder = "") {
  const questions = [
    {
      type: "input",
      name: "estimatedTime",
      message: `What's the estimated time, in minutes, to complete this challenge ${folder}?`,
      default: data.estimatedTime || 15,
      filter: function (answer) {
        return Number(answer);
      },
      validate: function (answer) {
        if (isNaN(answer) || answer < 5 || answer > 2400) {
          return "Please enter a number between 5 and 2400";
        }
        return true;
      },
    },
    {
      type: "list",
      name: "difficulty",
      message: `What's the difficulty of this challenge ${folder}?`,
      default: data.difficulty,
      choices: [
        {
          key: "none",
          name: "none",
          value: null,
        },
        {
          key: "b",
          name: "Basic",
          value: 1,
        },
        {
          key: "i",
          name: "Intermediate",
          value: 2,
        },
        {
          key: "a",
          name: "Advanced",
          value: 3,
        },
        {
          key: "m",
          name: "master",
          value: 4,
        },
      ],
    },
    {
      type: "checkbox",
      name: "runConfig",
      message: `Which services are needed ${folder}?`,
      default: (data.runConfig || {}).services,
      choices: [
        {
          key: "redis",
          name: "redis",
          value: "redis",
        },
        {
          key: "mongodb 3.4",
          name: "mongodb 3.4",
          value: "mongodb",
        },
        {
          key: "mongodb 4",
          name: "mongodb 4",
          value: "mongodb@4.0",
        },
        {
          key: "postgres 9.6",
          name: "postgres 9.6",
          value: "postgres",
        },
        {
          key: "postgres 13",
          name: "postgres 13",
          value: "postgres@13.0",
        },
      ],
      filter: function (answer) {
        return {
          ...(data.runConfig || defaultRunConfig),
          services: answer,
        };
      },
      validate: (answer) => {
        if (
          answer.services.includes("mongodb") &&
          answer.services.includes("mongodb@4.0")
        ) {
          return "Select at most one mongodb service";
        }
        if (
          answer.services.includes("postgres") &&
          answer.services.includes("postgres@13.0")
        ) {
          return "Select at most one postgres service";
        }
        return true;
      },
    },
  ];

  return inquirer.prompt(questions);
}

module.exports = challengeOptions;
