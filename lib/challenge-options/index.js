const inquirer = require("inquirer");

/**
 * Prompts the user about various challenge options.
 */
async function challengeOptions () {
  const questions = [
    {
      type: "input",
      name: "estimatedTime",
      message: "What's the estimated time to complete this challenge?",
      default: 15,
      validate: function (answer) {
        const minutes = Number(answer);
        if (isNaN(minutes) || minutes < 5 || minutes > 600) {
          return "Please enter a number between 5 and 600";
        }
        return true;
      },
    },
    {
      type: "checkbox",
      name: "services",
      message: "Which services are needed?",
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
        }, {
          key: "postgres 13",
          name: "postgres 13",
          value: "postgres@13.0",
        },
      ],
      validate: (answer) => {
        if (answer.includes("mongodb") && answer.includes("mongodb@4.0")) {
          return "Select at most one mongodb service";
        }
        if (answer.includes("postgres") && answer.includes("postgres@13.0")) {
          return "Select at most one postgres service";
        }
        return true;
      },
    },
  ];
  return inquirer.prompt(questions);
}

module.exports = challengeOptions;
