# Authoroo

Utility to make it easier to create and edit modules in the [web-dev-programs](https://github.com/Thinkful-Ed/web-dev-programs) repository.

![Authoroo](authoroo.gif)

## Usage

From the command line run `npx Thinkful-Ed/authoroo` for help.

## Install globally

To install globally, so it does not have to download a new version every time, run the following command.

`npm install -g Thinkful-Ed/authoroo`

If yon install globally, you should also consider watching the repo to get notified when changes happen and can re-install to get the latest version.

### Linking an Existing Challenge

If a code challenge exists in the `web-deb-programs` repository but does not contain an `assessment.json` or `challenge.json` file, that means there is no link between the checkpoint and the challenge on qualified.

You can create a link to the Qualified challenge with the following steps:

`authoroo` creates a folder named _qualified_ inside the checkpoint folder and stores all code from Qualified there.

If you have an existing folder, rename it to _qualified_.

Run

```bash
authoroo extract -q <QUALIFIED_API_KEY>
```

at the root of the `web-dev-programs` repository.

You are then prompted for the module and the checkpoint.

```bash
? Which module?
  zid-be-connecting-it-all
  zid-be-creating-relations
❯ zid-be-node-express
  zid-be-postgresql
  zid-be-project-grub-dash
  zid-be-robust-server-structure
  zid-fe-css-frameworks
  zid-fe-deployment
  zid-fe-front-end-foundations
  zid-fe-jsdom
  zid-fe-project-flashcards
```

Select the appropriate module and checkpoint. Next you are prompted to enter the qualified assessment id.

The Qualified challenge and related files are downloaded into the _qualified_ folder. For example:

```bash
?/web-dev-programs/library/zid-be-node-express-XX-assignment
├── assessment.json
├── challenge.json
├── content.md
└── qualified
   ├── Dockerfile
   ├── docs
   ├── package-lock.json
   ├── package.json
   ├── readme.md
   ├── solution
   ├── src
   ├── test
   └── tests

directory: 6 file: 7
```

### Push updated challenge to Qualified

After making necessary changes to the files you may push these changes to Qualified using the `authoroo publish` command.

At the root of the `web-dev-programs` repository run the command:

```bash
authoroo publish -q <QUALIFIED _API_KEY>
```

Once again you will be prompted to select the module and checkpoint. Once selected, you will be asked some basic challenge configuration questions. The defaults will use values from the existing assessment.json file, so you can keep these values by hitting enter, or update them by entering new values. If this is the first time creating the challenge, enter the appropriate values for each prompt.

```bash
? Which module? zid-be-node-express
? Which checkpoint? Xx Assignment
? What's the estimated time, in minutes, to complete this challenge? 90
? What's the difficulty of this challenge? Intermediate
```

The updated code is them pushed to Qualified.

Links are printed out for the assessment and challenge, so you can review and publish the challenge and assessment on Qualified.io
