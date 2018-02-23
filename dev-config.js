module.exports = function createDevConfig(serviceWorker, favPath) {
	let plugins = [];

	if (serviceWorker) {
		plugins.push("new WorkboxPlugin({clientsClaim: true, skipWaiting: true})");
	}

	if (favPath) {
		plugins.push("new FaviconsWebpackPlugin('" + favPath + "')");
	}

	let devConfig = {
		plugins
	};

	return devConfig;
};
