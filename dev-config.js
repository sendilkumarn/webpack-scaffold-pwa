const getWebappWebpackPlugin = config => 
	`new WebappWebpackPlugin({
		logo: './${config.favPath}',
		favicons: {
			appName: '${config.manifestDetails.shortName}',
			appDescription: '${config.manifestDetails.description}',
			start_url: '${config.manifestDetails.startURL}',
			theme_color: '${config.manifestDetails.themeColor}'
		}
	})`;

const getSwDetails = config => 
		`new GenerateSW({
			clientsClaim: true,
			skipWaiting: true,
			runtimeCaching: [{
				urlPattern: /\\/\$/,
				handler: 'networkFirst',
				options: {
			  		cacheName: 'sw-app-index'
				}
			}]
		})`;

module.exports = function createDevConfig(config) {
	let plugins = [];
	if (config) {
		if (config.serviceWorker) {
			plugins.push(getSwDetails(config), "new HtmlWebpackPlugin({filename:'index.html',template:'./templates/_index.html'})");
		}
		if (config.favPath) {
			plugins.push(getWebappWebpackPlugin(config));
		}
	}

	return { plugins };
};
