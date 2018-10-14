import { Confirm, Input } from "@webpack-cli/webpack-scaffold";
import Generator from "yeoman-generator";
import createDevConfig from "./dev-config";
import questions from "./questions";
import getPackageManager from "./utils/package-manager";
import welcomeMessage from "./utils/welcome";

module.exports = class WebpackGenerator extends Generator {

 [x: string]: any;
 public dependencies: string[];
 public devConfig: any;
 public webpackOptions: any;
 public manifestDetails: any;

 constructor(args, opts) {
  super(args, opts);
  this.dependencies = ["webpack"];

  opts.env.configuration = {
   dev: {
    manifestDetails: {},
    webpackOptions: {},
   },
  };
  this.devConfig = {
            manifestDetails: {},
            webpackOptions: {},
        };
  this.webpackOptions = this.devConfig.webpackOptions;
  this.manifestDetails = this.devConfig.manifestDetails;
 }

 /**
  * Prompts user for actions on CLI
  * It uses prompt() method from Inquirer.js
  * @returns {void}
  */
 public prompting(): Promise<void> {

  const done = this.async();
  let serviceWorker: boolean = false;
  let manifestDetails: object = {};
  let favPath: string;
  let outputDir: string;

  this.devConfig.topScope = [
  "const webpack = require('webpack')",
  "const path = require('path')",
  ];

  welcomeMessage();
  return this.prompt(questions.entryQuestion)
  .then((entryAnswer) => {
    this.webpackOptions.entry = entryAnswer.entryFile;

    return this.prompt([Confirm("serviceWorker", "Do you want to add Service Worker?")]);
  })
  .then((answer) => {
    serviceWorker = answer.serviceWorker;
    if (serviceWorker) {
    this.devConfig.topScope.push(
      'const { GenerateSW } = require("workbox-webpack-plugin");',
    );
    this.devConfig.topScope.push(
      'const HtmlWebpackPlugin = require("html-webpack-plugin");',
    );
    this.dependencies.push("workbox-webpack-plugin", "html-webpack-plugin");
    }

    return this.prompt([Confirm("hasManifest", "Do you have an existing Manifest File?", ["Yes", "No"])]);
  })
  .then((answer) => {
    if (answer.hasManifest) {
    return this.prompt([Input("manifestPath", "Enter the path to your Manifest file")]);
    } else {
    const {
      nameQuestion,
      shortNameQuestion,
      descriptionQuestion,
      homePageQuestion,
      themeColorQuestion,
      startUrlQuestion,
    } = questions;

    return this.prompt([
      nameQuestion,
      shortNameQuestion,
      descriptionQuestion,
      homePageQuestion,
      themeColorQuestion,
      startUrlQuestion,
    ]);
    }
  })
  .then((manifestAnswer) => {
    const { description, name, shortName, startURL, themeColor } = manifestAnswer;
    manifestDetails = {
    description,
    name,
    shortName,
    startURL,
    themeColor,
    };
    return this.prompt([Confirm("favicon", "Do you have a existing Favicon to add ?")]);
  })
  .then((answer) => {
    if (answer.favicon === true) {
    // Binding the value of `this`
    questions.faviconQuestion.validate = questions.faviconQuestion.validate.bind(this);
    return this.prompt([questions.faviconQuestion]);
    } else {
    this.fs.copy(
      this.templatePath("webpackIcon.png"),
      this.destinationPath("./icon.png"),
    );
    this.devConfig.topScope.push('const WebappWebpackPlugin = require("webapp-webpack-plugin");');
    this.dependencies.push("webapp-webpack-plugin");
    favPath = "./icon.png";
    }
  })
  .then((answer) => {
    if (answer) {
    favPath = answer.favPath;
    this.devConfig.topScope.push('const WebappWebpackPlugin = require("webapp-webpack-plugin");');
    this.dependencies.push("webapp-webpack-plugin");
    }

    return this.prompt([questions.outputDirQuestion]);
  })
  .then((answer) => {
    if (answer) {
    outputDir = answer.outputDir;
    this.webpackOptions.output = {
      filename: "'bundle.js'",
      path: `path.resolve(__dirname, '${outputDir}')`,
    };
    }

    const config: object = {
    favPath,
    manifestDetails,
    outputDir,
    serviceWorker,
    };

    this.webpackOptions.plugins = createDevConfig(config).plugins;
    this.manifestDetails = manifestDetails;
    done();
  });
 }

 /**
  * Installs dependencies using returned package manager
  * @returns {void}
  */
 public installPlugins(): void {
  const pkgManager = getPackageManager();
  if (pkgManager === "yarn") {
  this.runInstall(pkgManager, this.dependencies, {
    dev: true,
  });
  } else {
  this.runInstall(pkgManager, this.dependencies, {
    "save-dev": true,
  });
  }
 }

 /**
  * Reads JSON file from a given path
  * @param {*} filePath path at which file is located
  * @returns {*} fileInJSON
  */
 public readJSONFile(filePath: any): any {
  const fileInJSON = this.fs.readJSON(this.destinationPath(filePath), {});
  return fileInJSON;
 }

 /**
  * Writes JSON to file at a given path
  * @param {*} filePath path of file
  * @param {*} jsonData Object to be written in file
  * @returns {void}
  */
 public writeToJSONFile(filePath: any, jsonData: any = {}): void {
  this.fs.writeJSON(this.destinationPath(filePath), jsonData);
 }

 /**
  * Writes generator files to file system
  * @returns {void}
  */
 public writing(): void {
  this.config.set("configuration", this.devConfig);
  this.fs.copy(
  this.templatePath("_index.js"),
  this.destinationPath(
    this.webpackOptions.entry.slice(1, this.webpackOptions.entry.lastIndexOf("'")),
  ),
  );
  this.fs.copyTpl(
  this.templatePath("_index.html"),
  this.destinationPath("./templates/_index.html"),
  {
    description: this.manifestDetails.description,
    title: this.manifestDetails.name,
  },
  );

  // Adding webpack build script to generated package.json
  const pkg = this.readJSONFile("package.json");
  const scripts: object = {
  "build": "webpack --mode development --config ./webpack.config.js",
  "build:prod": "webpack --mode production --config ./webpack.config.js",
  };
  pkg.scripts = { ...pkg.scripts, ...scripts};
  this.writeToJSONFile("package.json", pkg);
 }
};
