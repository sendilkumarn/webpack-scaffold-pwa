const Generator = require('yeoman-generator');
const Confirm = require('webpack-addons').Confirm;
const Input = require('webpack-addons').Input;
const createDevConfig = require('./dev-config');
const path = require('path');

module.exports = class WebpackGenerator extends Generator {
	constructor(args, opts) {
		super(args, opts);
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

		this.options.env.configuration.dev.topScope = [];

		return this.prompt([Confirm('serviceWorker', 'Do you want to add Service Worker?')])
			.then(answer => {
				serviceWorker = answer['serviceWorker'];
				if (serviceWorker) {
					this.options.env.configuration.dev.topScope.push(
						'const { GenerateSW } = require("workbox-webpack-plugin");'
					);
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
						type: 'input'

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
					this.options.env.configuration.dev.topScope.push('const FaviconsWebpackPlugin = require("favicons-webpack-plugin");');
				}

				let outputDirQuestion = {
					default: () => "/build",
					message: 'Enter the path to directory where you would like to generate builds: ',
					name: 'outputDir',
					type: 'input'
				};

				return this.prompt([outputDirQuestion]);
			})
			.then(answer => {
				if (answer) {
					outputDir = answer['outputDir'];
				}

				const config = {
					favPath,
					manifestDetails,
					outputDir,
					serviceWorker
				};

				this.options.env.configuration.dev.webpackOptions = createDevConfig(config);
				done();
			});
	}
};
