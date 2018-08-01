const Generator = require('yeoman-generator');
const Confirm = require('@webpack-cli/webpack-scaffold').Confirm;
const createDevConfig = require('./dev-config');
const getPackageManager = require('./utils/package-manager');
const path = require('path');

module.exports = class WebpackGenerator extends Generator {
	constructor(args, opts) {
		super(args, opts);
		this.dependencies = ["webpack"];
		opts.env.configuration = {
			dev: {
				manifestDetails: {},
				webpackOptions: {}
			}
		};
	}

	prompting() {
		let done = this.async();
		let serviceWorker = false;
		let manifestDetails = {};
		let favPath;
		let outputDir;

		this.options.env.configuration.dev.topScope = [
			"const webpack = require('webpack')",
			"const path = require('path')"
		];

		const entryQuestion = {
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

					const themeColorQuestion = {
						default: () => "#ffffff",
						message: 'Please enter the theme color of your application.',
						name: 'themeColor',
						type: 'input',
						validate: value => {
							const pattern = /^#(?:[0-9a-fA-F]{3}){1,2}$/i;
							if(pattern.test(value)) {
								return true;
							} else {
								return "Invalid Hex color code. A valid color looks like #de54ef or #abc";
							}
						}
					};

					return this.prompt([nameQuestion, shortNameQuestion, descriptionQuestion, themeColorQuestion]);
			})
			.then(manifestAnswer => {
				manifestDetails = {
					"description": manifestAnswer.description,
					"name": manifestAnswer.name,
					"shortName": manifestAnswer.shortName,
					"themeColor": manifestAnswer.themeColor
				};
				return this.prompt([Confirm('favicon', 'Do you have a existing Favicon to add ?')]);
			})
			.then(answer => {
				if (answer['favicon']) {
					const faviconQuestion = {
						message: 'Enter path to your logo (in .svg or .png): ',
						name: 'favicon',
						type: 'input',
						validate: value => {
							if(this.fs.exists(value)) {
								if(value.endsWith(".png")||value.endsWith(".svg")) {
									return true;
								}else{
									return "Favicon can be in .svg or .png only";
								}
							}else{
								return "Given file doesn't exists.";
							}
						}
					};
					return this.prompt([faviconQuestion]);
        } else{
					this.fs.copy(
						this.templatePath('webpackIcon.png'),
						this.destinationPath('./icon.png')
					);
					this.options.env.configuration.dev.topScope.push('const WebappWebpackPlugin = require("webapp-webpack-plugin");');
					this.dependencies.push("webapp-webpack-plugin");
					favPath = './icon.png';
				}
			})
			.then(answer => {
				if (answer) {
					favPath = answer['favPath'];
					this.options.env.configuration.dev.topScope.push('const WebappWebpackPlugin = require("webapp-webpack-plugin");');
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
		this.fs.copyTpl(
			this.templatePath('_index.html'),
			this.destinationPath('./templates/_index.html'),
			{
				title: this.options.env.configuration.dev.manifestDetails.name
			}
		);
	}
};
