module.exports = `{
  "name": "{{checkpoint}}",
  "version": "1.0.0",
  "description": "{{checkpoint}} qualified challenge.",
  "scripts": {
    "docker:build": "docker image build . -t thinkful-ed/{{checkpoint}}",
    "docker:run": "docker run --rm -it -p {{port}}:{{port}} thinkful-ed/{{checkpoint}}",
    "docker:stop": "docker stop $(docker ps -q)",
    "docker:test": "docker run -i thinkful-ed/{{checkpoint}} npm test",
    "start:solution": "npm run -it docker:build && npm run docker:run",
    "test": "jest",
    "test:solution": "npm run docker:build && npm run docker:test"
  },
  "keywords": [],
  "author": "Thinkful.com",
  "license": "UNLICENSED",
  "devDependencies": {
    "jest": "^26.6.3",
    "jest-reporter": "^1.0.1"
  }
}
`;
