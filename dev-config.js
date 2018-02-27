module.exports = function createDevConfig(serviceWorker, favPath) {
	let plugins = [];

	if (serviceWorker) {
		plugins.push("new GenerateSW()");
	}

	if (favPath) {
		plugins.push("new FaviconsWebpackPlugin('" + favPath + "')");
	}

	let devConfig = {
		plugins
	};

	return devConfig;
};
