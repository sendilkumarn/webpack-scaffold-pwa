const path = require('path'),
	webpack = require('webpack');

module.exports = {
	entry: './generator.js',

	output: {
		path: path.resolve(__dirname, 'build'),
		publicPath: 'build'
	},
	plugins: [
		// To ignore electron module from being generated
		new webpack.IgnorePlugin(/electron/)
	],
	target: 'node'
};
