"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");

module.exports = class extends Generator {
  /**
   * Determines if the supplied string is a "repo reference" by looking for
   * the existence of a single forward slash character.
   * @param repo {string} The possible repo reference to check
   * @returns {boolean} True if the supplied string contains a single forward slash character; false otherwise
   * @private
   */
  _isRepoRef(repo) {
    const firstForwardSlashIndex = repo.indexOf("/");
    if (firstForwardSlashIndex > -1) {
      const lastForwardSlashIndex = repo.lastIndexOf("/");
      if (lastForwardSlashIndex === firstForwardSlashIndex) {
        return true;
      }
    }

    return false;
  }

  async prompting() {
    // Have Yeoman greet the user
    this.log(
      yosay(`Welcome to the tiptop ${chalk.red("Golang CLI app")} generator!`)
    );

    /** @type {Record<string,string|number|boolean>} */
    this.props = await this.prompt([
      {
        type: "input",
        name: "appname",
        message: "Your app name (e.g. mycliapp)",
        default: "mycliapp"
      },
      {
        type: "input",
        name: "repourl",
        message: "Repository URL (e.g. neflyte/mycliapp or mycliapp)",
        default: "mycliapp"
      },
      {
        type: "confirm",
        name: "nogomodtidy",
        message:
          "Remote repository URLs require the repository to actually exist or 'go mod tidy' will fail. Skip running 'go mod tidy' after generating the project?",
        when: props => this._isRepoRef(props.repourl),
        default: true
      }
    ]);

    // If repourl contains a single forward slash then prepend github.com/ to it
    const repourl = String(this.props.repourl);
    if (this._isRepoRef(repourl)) {
      this.props.repourl = `github.com/${repourl}`;
    }
  }

  async writing() {
    // Set up the template context
    /** @type {Record<string,string>} */
    const templateCtx = {
      appname: this.props.appname,
      repourl: this.props.repourl
    };
    // Set up the list of templated files
    /** @type {Record<string,string>} */
    this._templateFileMap = {
      "cmd/changeme/main.go": `cmd/${this.props.repourl}/main.go`,
      "cmd/changeme/cmd/root.go": `cmd/${this.props.repourl}/cmd/root.go`,
      "internal/logger/logger.go": "internal/logger/logger.go",
      ".gitignore": ".gitignore",
      "CHANGELOG.md": "CHANGELOG.md",
      Makefile: "Makefile",
      "README.md": "README.md"
    };
    // Set up the list of non-templated files
    /** @type {Record<string,string>} */
    this._fileMap = {
      ".editorconfig": ".editorconfig",
      ".golangci.yml": ".golangci.yml",
      VERSION: "VERSION"
    };

    // Copy non-templated files
    for (const [src, dest] of Object.entries(this._fileMap)) {
      this.fs.copy(this.templatePath(src), this.destinationPath(dest));
    }

    // Copy templated files
    for (const [src, dest] of Object.entries(this._templateFileMap)) {
      this.fs.copyTpl(
        this.templatePath(src),
        this.destinationPath(dest),
        templateCtx
      );
    }

    // Run `go mod init` to create a new go.mod file
    this.spawnCommandSync("go", ["mod", "init", this.props.repourl]);
  }

  install() {
    // Set up the list of dependencies
    /** @type {string[]} */
    const _deps = [
      "github.com/spf13/cobra@v1.2.1",
      "github.com/rs/zerolog@v1.23.0"
    ];
    // Add the dependencies and create the go.sum file
    /** @type {string[]} */
    const args = ["get"];
    for (const dep of _deps) {
      args.push(dep);
      try {
        this.spawnCommandSync("go", args);
      } finally {
        args.pop();
      }
    }

    if (!this.props.nogomodtidy) {
      // Run `go mod tidy` to tidy the go.sum file
      this.spawnCommandSync("go", ["mod", "tidy"]);
    }
  }
};
