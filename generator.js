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

		this.options.env.configuration.dev.topScope = [];

		return this.prompt([Confirm('serviceWorker', 'Do you want to add Service Worker?')])
			.then(answer => {
				serviceWorker = answer['serviceWorker'];
				if (serviceWorker) {
					this.options.env.configuration.dev.topScope.push(
						'const { GenerateSW } = require("workbox-webpack-plugin");'
					);
				}

				return this.prompt([Confirm('manifest', 'Do you want to add Manifest File?')]);
			})
			.then(answer => {
				if (answer['manifest']) {
					let nameQuestion = {
						default: () => process.cwd().split(path.sep)
													.pop(),
						message: "What is the name of your application?",
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
						type: 'imput'
					};

					let themeColorQuestion = {
						default: () => "#ffffff",
						message: 'Please enter the theme color of your application.',
						name: 'themeColor',
						type: 'imput'

					};

					return this.prompt([nameQuestion, shortNameQuestion, homePageQuestion, themeColorQuestion]);
				}
			})
			.then(manifestAnswer => {
				if ('name' in manifestAnswer) {
					manifestDetails = {
						"homePage": manifestAnswer.homePage,
						"name": manifestAnswer.name,
						"shortName": manifestAnswer.shortName,
						"themeColor": manifestAnswer.themeColor
					};
				}

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
				this.options.env.configuration.dev.webpackOptions = createDevConfig(serviceWorker, favPath, manifestDetails);
				done();
			});
	}
};
