const Generator = require('yeoman-generator');
const List = require('webpack-addons').List;
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
		return this.prompt([
			List('serviceWorker', 'Do you want to add Service Worker?', ['Yes', 'No'])
		]).then (answer => {
			if(answer['serviceWorker'] === 'Yes') {
				this.options.env.configuration.dev.webpackOptions = createDevConfig(answer);
				this.options.env.configuration.dev.topScope = [
					'const WorkboxPlugin = require("workbox-webpack-plugin");'
				];
			}
		});
	}
};