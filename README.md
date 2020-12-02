# Authoroo

Utility to make it easier to create and edit `zid` modules in the [web-dev-programs](https://github.com/Thinkful-Ed/web-dev-programs) repository.

## Usage

From the command line run `npx Thinkful-Ed/authoroo` for help.

### Linking an Existing Challenge

If a code challenge exists in the repo you can link it to a Qualified challenge with the following steps.

`authoroo` creates a folder named _qualified_ inside the checkpoint folder and stores all code from Qualified there.

If you have an existing folder rename it to _qualified_.

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

Select the appropriate module and checkpoint. Next enter the qualified assessment id.

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

After making necessary changes to the files you may push these changes to Qualified using the `authoroo assessment` command.

At the root of the `web-dev-programs` repository run the command:

```bash
authoroo assessment -q <QUALIFIED _API_KEY>
```

Once again you will be prompted to select the module and checkpoint. Once selected you will be asked some basic challenge configuration questions. The defaults are all fine.

```bash
? Which module? zid-be-node-express
? Which checkpoint? Xx Assignment
? What's the estimated time, in minutes, to complete this challenge? 90
? What's the difficulty of this challenge? Intermediate
? Copy from? (5d562fc4ea796d000fe59b7c)
```

The updated code is pushed to Qualified.
