let getWebappWebpackPlugin = config => {
	let text = "new WebappWebpackPlugin({";
	text+="logo:'"+config.favPath+"',";
	text+="favicons: {";
	text+="appName:'"+config.manifestDetails.shortName+"',";
	text+="appDescription:'"+config.manifestDetails.description+"',";
	text+="theme_color:'"+config.manifestDetails.themeColor+"',";
	text+="}})";
	return text;
};

module.exports = function createDevConfig(config) {
	let plugins = [];
	if (config) {
		if (config.serviceWorker) {
			plugins.push("new GenerateSW()", "new HtmlWebpackPlugin({filename:'index.html',template:'./templates/_index.html'})");
		}
		if (config.favPath) {
			plugins.push(getWebappWebpackPlugin(config));
		}
	}

	return { plugins };
};
