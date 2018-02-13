module.exports = function createDevConfig(answer) {	
	let devConfig = {
		plugins: [
			"new WorkboxPlugin({clientsClaim: true,skipWaiting: true})"
		]
	};
	return devConfig;
};