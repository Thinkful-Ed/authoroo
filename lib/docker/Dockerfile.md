# Dockerfile

> **Note**: Feel free to delete this file. It is just documentation for you to get the project setup correctly.

In order to have the local development have functional parody with Qualified.io, you will use Docker
to run or test the solution code. Essentially, anything in the `./solution` folder overwrites anything in the rest the project.

## npm scripts

Keeping any existing scripts, and add the following scripts to package.json

```json
{
  "scripts": {
    "docker:run": "docker run --rm -it -p {{port}}:{{port}} thinkful-ed/{{checkpoint}}",
    "docker:stop": "docker stop $(docker ps -q)",
    "docker:test": "docker run -it thinkful-ed/{{checkpoint}} npm test",
    "start:solution": "npm run -it docker:build && npm run docker:run",
    "test:solution": "npm run docker:build && npm run docker:test"
  }
}
```

## Don't need Docker?

Sometimes Docker is overkill, especially if all you need to do is load a different file to run the solution or tests. In this case, it is
easier to use an environment variable to load the solution file. For example, imagine that you have a project with the following structure:

```
├── solution
│   └── src
│       └── main.js
├── src
│   └── main.js
└── test
    └── main.test.js
```

In this case, Docker is too much because `main.test.js` just needs to test one file or the other.

Just update the `require()` statement to load the file using a `SOLUTION_PATH` environment variable.

```javascript
const path = require("path");

const main = require(path.resolve(
  `${process.env.SOLUTION_PATH || ""}`,
  "src/main"
));
```

Then add the following scripts to the package.json file, which set `SOLUTION_PATH` to `solution`.

```json
{
  "scripts": {
    "start:solution": "SOLUTION_PATH=solution nodemon src/main.js",
    "test:solution": "SOLUTION_PATH=solution jest"
  }
}
```

No you can run and test the solution code, or the project code without using Docker.
