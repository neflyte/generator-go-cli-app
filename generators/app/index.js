"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");

module.exports = class extends Generator {
  async prompting() {
    // Have Yeoman greet the user
    this.log(
      yosay(`Welcome to the tiptop ${chalk.red("Golang CLI app")} generator!`)
    );

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
      }
    ]);

    // If repourl contains a single forward slash then prepend github.com/ to it
    const repourl = String(this.props.repourl);
    const firstForwardSlashIndex = repourl.indexOf("/");
    if (firstForwardSlashIndex > -1) {
      const lastForwardSlashIndex = repourl.lastIndexOf("/");
      if (lastForwardSlashIndex === firstForwardSlashIndex) {
        // Just one forward slash
        this.props.repourl = `github.com/${repourl}`;
      }
    }
  }

  async writing() {
    // Set up the template context
    const templateCtx = {
      appname: this.props.appname,
      repourl: this.props.repourl
    };
    // Set up the list of templated files
    this._templateFileMap = {
      "cmd/changeme/main.go": `cmd/${this.props.repourl}/main.go`,
      "cmd/changeme/cmd/root.go": `cmd/${this.props.repourl}/cmd/root.go`,
      "internal/logger/logger.go": "internal/logger/logger.go",
      ".gitignore": ".gitignore",
      "CHANGELOG.md": "CHANGELOG.md",
      "go.mod": "go.mod",
      Makefile: "Makefile",
      "README.md": "README.md"
    };
    // Set up the list of non-templated files
    this._fileMap = {
      ".editorconfig": ".editconfig",
      ".golangci.yml": ".golangci.yml",
      VERSION: "VERSION"
    };

    // Copy non-templated files
    for (const [src, dest] of Object.entries(this._fileMap)) {
      this.log(`Copying ${src} to ${dest}`);
      this.fs.copy(this.templatePath(src), this.destinationPath(dest));
    }

    // Copy templated files
    for (const [src, dest] of Object.entries(this._templateFileMap)) {
      this.log(`Templating ${src} to ${dest}`);
      this.fs.copyTpl(
        this.templatePath(src),
        this.destinationPath(dest),
        templateCtx
      );
    }
  }

  install() {
    // Run `go mod tidy` to create the go.sum file and download the dependencies
    this.log("Tidying go.mod");
    this.spawnCommandSync("go", ["mod", "tidy"]);
  }
};
