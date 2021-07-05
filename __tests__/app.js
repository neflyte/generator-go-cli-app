"use strict";
const path = require("path");
const assert = require("yeoman-assert");
const helpers = require("yeoman-test");

describe("generator-go-cli-app:app", () => {
  const allFiles = [
    "cmd/clitest/main.go",
    "cmd/clitest/cmd/root.go",
    "internal/logger/logger.go",
    ".editorconfig",
    ".gitignore",
    ".golangci.yml",
    "CHANGELOG.md",
    "go.mod",
    "Makefile",
    "README.md",
    "VERSION"
  ];

  let runResult;
  let tempDir = "";

  beforeAll(async () => {
    try {
      runResult = helpers
        .run(path.join(__dirname, "../generators/app"))
        .withPrompts({
          appname: "clitest",
          repourl: "neflyte/clitest"
        });
      tempDir = await runResult.toPromise();
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  afterAll(() => {
    if (runResult) {
      runResult.restore();
    }
  });

  it("creates files", () => {
    for (const file of allFiles) {
      assert.file(path.join(tempDir, file));
    }
  });

  it("creates go.sum by invoking 'go mod tidy'", () => {
    assert.file(path.join(tempDir, "go.sum"));
  });
});
