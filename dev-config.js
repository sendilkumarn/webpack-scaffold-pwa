const createManifest = require('./create-manifest');
const fs = require('fs');

module.exports = function createDevConfig(serviceWorker, favPath, manifestDetails) {
	let plugins = [];

	if (serviceWorker) {
		plugins.push("new GenerateSW()");
	}

	if (favPath) {
		plugins.push("new FaviconsWebpackPlugin('" + favPath + "')");
	}

	if (Object.keys(manifestDetails).length > 0) {
		let fd = fs.openSync('manifest.json', 'w');
		fs.writeFileSync(fd, createManifest(manifestDetails));
	}

	let devConfig = {
		plugins
	};

	return devConfig;
};
