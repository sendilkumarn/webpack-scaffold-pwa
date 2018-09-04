import * as path from 'path';
import * as Generator from 'yeoman-generator';
import { Confirm, Input } from '@webpack-cli/webpack-scaffold';
import createDevConfig from './dev-config';
import getPackageManager from './utils/package-manager';
import welcomeMessage from './utils/welcome';

export default class WebpackGenerator extends Generator {
	dependencies: string[];
	devConfig: any;
	webpackOptions: any;
	manifestDetails: any;
	configuration: any;

	constructor(args, opts) {
		super(args, opts);
		this.dependencies = ["webpack"];
		opts.env.configuration = {
			dev: {
				manifestDetails: {},
				webpackOptions: {}
			}
		};
		this.devConfig = this.configuration.dev;
		this.webpackOptions = this.devConfig.webpackOptions;
		this.manifestDetails = this.devConfig.manifestDetails;
	}

	/**
	 * Prompts user for actions on CLI
	 * It uses prompt() method from Inquirer.js
	 **/
	prompting(){

		let serviceWorker = false;
		let manifestDetails = {};
		let favPath;
		let outputDir;
		const startUrlQuestion = {
			default: () => "/",
			message: "Enter startURL for your application: ",
			name: "startURL",
			type: "input"
		};

		this.devConfig.topScope = [
			"const webpack = require('webpack')",
			"const path = require('path')"
		];

		const entryQuestion: Object = {
			default: () => "'./index.js'",
			message: 'Which file would be the first to enter the application?',
			name: 'entryFile',
			type: 'input',
			validate: value => {
				const pattern = /[^\s]*.js/i;
				if (pattern.test(value)) {
					return true;
				} else {
					return "Invalid path or file.";
				}
			}
		};
		welcomeMessage();
		return this.prompt(entryQuestion)
			.then(entryAnswer => {
				this.webpackOptions.entry = entryAnswer['entryFile'];

				return this.prompt([Confirm('serviceWorker', 'Do you want to add Service Worker?')]);
			})
			.then(answer => {
				serviceWorker = answer['serviceWorker'];
				if (serviceWorker) {
					this.devConfig.topScope.push(
						'const { GenerateSW } = require("workbox-webpack-plugin");'
					);
					this.devConfig.topScope.push(
						'const HtmlWebpackPlugin = require("html-webpack-plugin");'
					);
					this.dependencies.push("workbox-webpack-plugin", "html-webpack-plugin");
				}

				return this.prompt([Confirm('hasManifest', 'Do you have an existing Manifest File?', ['Yes', 'No'])]);
			})
			.then(answer => {
				if (answer['hasManifest']) {
					return this.prompt([Input('manifestPath', 'Enter the path to your Manifest file')]);
				} else {
					const nameQuestion = {
						default: () => process.cwd().split(path.sep)
							.pop(),
						message: "Let's create one. What is the name of your application?",
						name: 'name',
						type: 'input',
						validate: value => {
							if (value.length <= 45) {
								return true;
							} else {
								return "Name is too long. Please enter a shorter name (less than 45 characters)";
							}
						}
					};

					const shortNameQuestion = {
						default: () => process.cwd().split(path.sep)
							.pop(),
						message: "Enter a short name for your application",
						name: 'shortName',
						type: 'input',
						validate: value => {
							if (value.length <= 12) {
								return true;
							} else {
								return "Short Name is too long. Please enter a shorter name (less than 12 characters)";
							}
						}
					};

					const descriptionQuestion = {
						message: 'Enter description of you application: ',
						name: 'description',
						type: 'input'
					};

					const homePageQuestion = {
						default: () => "index.html",
						message: 'What is the name of the home page of your application?',
						name: 'homePage',
						type: 'input'
					};

					const themeColorQuestion = {
						default: () => "#ffffff",
						message: 'Please enter the theme color of your application.',
						name: 'themeColor',
						type: 'input',
						validate: value => {
							const pattern = /^#(?:[0-9a-fA-F]{3}){1,2}$/i;
							if (pattern.test(value)) {
								return true;
							} else {
								return "Invalid Hex color code. A valid color looks like #de54ef or #abc";
							}
						}
					};

					return this.prompt([nameQuestion, shortNameQuestion, descriptionQuestion, homePageQuestion, themeColorQuestion, startUrlQuestion]);
				}
			})
			.then(manifestAnswer => {
				const { description, name, shortName, startURL, themeColor } = manifestAnswer;
				manifestDetails = {
					description,
					name,
					shortName,
					startURL,
					themeColor
				};
				return this.prompt([Confirm('favicon', 'Do you have a existing Favicon to add ?')]);
			})
			.then(answer => {
				if (answer['favicon'] === true) {
					const faviconQuestion = {
						message: 'Enter path to your logo (in .svg or .png): ',
						name: 'favPath',
						type: 'input',
						validate: value => {
							if (this.fs.exists(value)) {
								if (value.endsWith(".png") || value.endsWith(".svg")) {
									return true;
								} else {
									return "Favicon can be in .svg or .png only";
								}
							} else {
								return "Given file doesn't exists.";
							}
						}
					};
					return this.prompt([faviconQuestion]);
				} else {
					this.fs.copy(
						this.templatePath('webpackIcon.png'),
						this.destinationPath('./icon.png')
					);
					this.devConfig.topScope.push('const WebappWebpackPlugin = require("webapp-webpack-plugin");');
					this.dependencies.push("webapp-webpack-plugin");
					favPath = './icon.png';
				}
			})
			.then(answer => {
				if (answer) {
					favPath = answer['favPath'];
					this.devConfig.topScope.push('const WebappWebpackPlugin = require("webapp-webpack-plugin");');
					this.dependencies.push("webapp-webpack-plugin");
				}

				const outputDirQuestion = {
					default: () => './dist',
					message: 'Enter the path to directory where you would like to generate builds: ',
					name: 'outputDir',
					type: 'input'
				};

				return this.prompt([outputDirQuestion]);
			})
			.then(answer => {
				if (answer) {
					outputDir = answer['outputDir'];
					this.webpackOptions.output = {
						filename: "'bundle.js'",
						path: `path.resolve(__dirname, '${outputDir}')`
					};
				}

				const config = {
					favPath,
					manifestDetails,
					outputDir,
					serviceWorker
				};

				this.webpackOptions.plugins = createDevConfig(config).plugins;
				this.manifestDetails = manifestDetails;
			});
	}

	/**
	 * Installs dependencies using returned package manager
	 * @returns {void}
	 */
	installPlugins(): void {
		const pkgManager = getPackageManager();
		if(pkgManager==="yarn") {
			this.runInstall(pkgManager, this.dependencies, {
				"dev": true
			});
		}else{
			this.runInstall(pkgManager, this.dependencies, {
				"save-dev": true
			});
		}
	}

	/**
	 * Reads JSON file from a given path
	 * @param {*} filePath path at which file is located
	 * @returns {*} fileInJSON
	 */
	readJSONFile(filePath: any): any {
		const fileInJSON = this.fs.readJSON(this.destinationPath(filePath), {});
		return fileInJSON;
	}

	/**
	 * Writes JSON to file at a given path
	 * @param {*} filePath path of file
	 * @param {*} jsonData Object to be written in file
	 * @returns {void}
	 */
	writeToJSONFile(filePath: any, jsonData: any = {}): void {
		this.fs.writeJSON(this.destinationPath(filePath), jsonData);
	}

	/**
	 * Writes generator files to file system
	 * @returns {void}
	 */
	writing(): void {
		this.config.set("configuration", this.configuration);
		this.fs.copy(
			this.templatePath('_index.js'),
			this.destinationPath(
				this.webpackOptions.entry.slice(1, this.webpackOptions.entry.lastIndexOf("'"))
			)
		);
		this.fs.copyTpl(
			this.templatePath('_index.html'),
			this.destinationPath('./templates/_index.html'),
			{
				description: this.manifestDetails.description,
				title: this.manifestDetails.name
			}
		);

		// Adding webpack build script to generated package.json
		const pkg = this.readJSONFile('package.json');
		const scripts = {
			"build": "webpack --mode development --config ./webpack.config.js",
			"build:prod": "webpack --mode production --config ./webpack.config.js"
		};
		pkg.scripts = {...pkg.scripts, ...scripts};
		this.writeToJSONFile('package.json', pkg);
	}
};
