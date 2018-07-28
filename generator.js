const Generator = require('yeoman-generator');
const Confirm = require('@webpack-cli/webpack-scaffold').Confirm;
const Input = require('@webpack-cli/webpack-scaffold').Input;
const createDevConfig = require('./dev-config');
const getPackageManager = require('./utils/package-manager');
const path = require('path');

module.exports = class WebpackGenerator extends Generator {
	constructor(args, opts) {
		super(args, opts);
		this.dependencies = ["webpack"];
		opts.env.configuration = {
			dev: {
				webpackOptions: {}
			}
		};
	}

	prompting() {
		let done = this.async();

		let serviceWorker = false;
		let favPath;
		let manifestDetails = {};
		let outputDir;

		this.options.env.configuration.dev.topScope = [
			"const webpack = require('webpack')",
			"const path = require('path')"
		];

		let entryQuestion = {
			default: () => "'./index.js'",
			message: 'Which file would be the first to enter the application?',
			name: 'entryFile',
			type: 'input',
			validate: value => {
				const pattern = /[^\s]*.js/i;
				if(pattern.test(value)) {
					return true;
				} else {
					return "Invalid path or file.";
				}
			}
		};

		return this.prompt(entryQuestion)
			.then(entryAnswer => {
				this.options.env.configuration.dev.webpackOptions.entry = entryAnswer['entryFile'];

				return this.prompt([Confirm('serviceWorker', 'Do you want to add Service Worker?')]);
			})
			.then(answer => {
				serviceWorker = answer['serviceWorker'];
				if (serviceWorker) {
					this.options.env.configuration.dev.topScope.push(
						'const { GenerateSW } = require("workbox-webpack-plugin");'
					);
					this.options.env.configuration.dev.topScope.push(
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
					let nameQuestion = {
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

					let shortNameQuestion = {
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

					let homePageQuestion = {
						default: () => "index.html",
						message: 'What is the name of the home page of your application?',
						name: 'homePage',
						type: 'input'
					};

					let themeColorQuestion = {
						default: () => "#ffffff",
						message: 'Please enter the theme color of your application.',
						name: 'themeColor',
						type: 'input',
						validate: value => {
							const pattern = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/i;
							if(pattern.test(value)) {
								return true;
							} else {
								return "Invalid Hex color code. A valid color looks like #de54ef";
							}
						}
					};

					return this.prompt([nameQuestion, shortNameQuestion, homePageQuestion, themeColorQuestion]);
				}
			})
			.then(manifestAnswer => {
				if ('name' in manifestAnswer) {
					manifestDetails = {
						"hasManifest": false,
						"homePage": manifestAnswer.homePage,
						"name": manifestAnswer.name,
						"shortName": manifestAnswer.shortName,
						"themeColor": manifestAnswer.themeColor
					};
				} else {
					manifestDetails = {
						"hasManifest": true,
						"path": manifestAnswer.manifestPath
					};
				}

				this.options.env.configuration.dev.topScope.push('const CopyWebpackPlugin = require("copy-webpack-plugin")');
				this.dependencies.push("copy-webpack-plugin");

				return this.prompt([Confirm('favicon', 'Do you want to add Favicon?')]);
			})
			.then(answer => {
				if (answer['favicon']) {
					// TODO: Add the default value here
					return this.prompt([Input('favPath', 'Enter your fav icon path :')]);
				}
			})
			.then(answer => {
				if (answer) {
					favPath = answer['favPath'];
					this.options.env.configuration.dev.topScope.push('const WebappWebpackPlugin = require("webapp-webpack-plugin");');
					this.dependencies.push("webapp-webpack-plugin");
				}

				let outputDirQuestion = {
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
					this.options.env.configuration.dev.webpackOptions.output = {
						filename: "'[name].js'",
						path: `path.resolve(__dirname, '${outputDir}')`
					};
				}

				const config = {
					favPath,
					manifestDetails,
					outputDir,
					serviceWorker
				};

				this.options.env.configuration.dev.webpackOptions.plugins = createDevConfig(config).plugins;
				done();
			});
	}

	installPlugins() {
		this.runInstall(getPackageManager(), this.dependencies, {
			"save-dev": true
		});
	}

	writing() {
		this.config.set("configuration", this.options.env.configuration);
		this.fs.copy(
			this.templatePath('_index.js'),
			this.destinationPath(
				this.options.env.configuration.dev.webpackOptions.entry.slice(1, this.options.env.configuration.dev.webpackOptions.entry.lastIndexOf("'"))
			)
		);
		this.fs.copy(
			this.templatePath('_index.html'),
			this.destinationPath('./templates/_index.html')
		);
	}
};
