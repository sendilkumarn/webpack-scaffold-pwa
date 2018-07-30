const createManifest = require('./utils/create-manifest');
const fs = require('fs');
const manifestFile = 'manifest.json';

const getManifestPath = manifestDetails => {
	let manifestPath;
	if (manifestDetails.hasManifest) {
		manifestPath = manifestDetails.path;
	} else {
		const fd = fs.openSync(manifestFile, 'w');
		fs.writeFileSync(fd, createManifest(manifestDetails));
		manifestPath = "./" + manifestFile;
	}

	return manifestPath;
};

module.exports = function createDevConfig(config) {
	let plugins = [];
	if (config) {
		if (config.serviceWorker) {
			plugins.push("new GenerateSW()", "new HtmlWebpackPlugin({filename:'index.html',template:'./templates/_index.html'})");
		}
		if (config.favPath) {
			plugins.push("new WebappWebpackPlugin('" + config.favPath + "')");
		}
		if (config.manifestDetails) {
			plugins.push("new CopyWebpackPlugin([{ from: '" + getManifestPath(config.manifestDetails) + "', to: ''}])");
		}
	}

	return { plugins };
};
