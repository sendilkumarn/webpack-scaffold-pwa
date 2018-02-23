const Generator = require('yeoman-generator');
const Confirm = require('webpack-addons').Confirm;
const Input = require('webpack-addons').Input;
const createDevConfig = require('./dev-config');

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

		this.options.env.configuration.dev.topScope = [];

		return this.prompt([Confirm('serviceWorker', 'Do you want to add Service Worker?')])
			.then(answer => {
				serviceWorker = answer['serviceWorker'];
				if (serviceWorker) {
					this.options.env.configuration.dev.topScope.push(
						'const WorkboxPlugin = require("workbox-webpack-plugin");'
					);
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
					favPath = answer['favicon'];
					this.options.env.configuration.dev.topScope.push('const FaviconsWebpackPlugin = require("favicons-webpack-plugin");');
				}
				this.options.env.configuration.dev.webpackOptions = createDevConfig(serviceWorker, favPath);
				done();
			});
	}
};
