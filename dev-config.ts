const getWebappWebpackPlugin = (config) => `new WebappWebpackPlugin({
		logo: './${config.favPath}',
		favicons: {
			appName: '${config.manifestDetails.shortName}',
			appDescription: '${config.manifestDetails.description}',
			start_url: '${config.manifestDetails.startURL}',
			theme_color: '${config.manifestDetails.themeColor}'
		}
	})`;

const getSwDetails = () => `new GenerateSW({
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

export default function createDevConfig(config) {
 const plugins = [];
 if (config) {
  if (config.serviceWorker) {
   plugins.push(getSwDetails(), "new HtmlWebpackPlugin({filename:'index.html',template:'./templates/_index.html'})");
  }
  if (config.favPath) {
   plugins.push(getWebappWebpackPlugin(config));
  }
 }

 return { plugins };
}
