import test from 'ava';
import createDevConfig from './dev-config';

const favPath = "test.js";
const manifestDetails = {
	"description": "index.html",
	"hasManifest": false,
	"name": "test",
	"shortName": "test",
	"startURL": "/",
	"themeColor": "#ffffff"
};
const outputDir = "./dist";
const swExpected = `new GenerateSW({
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
const htmlExpected = "new HtmlWebpackPlugin({filename:'index.html',template:'./templates/_index.html'})";
const fpExpected = `new WebappWebpackPlugin({
		logo: './test.js',
		favicons: {
			appName: 'test',
			appDescription: 'index.html',
			start_url: '/',
			theme_color: '#ffffff'
		}
	})`;

test('create dev config to return when serviceworker is true', t => {
	const config = {
		"serviceWorker": true
	};
	const { plugins } = createDevConfig(config);
	t.is(plugins.length, 2);
	t.is(plugins[0], swExpected);
	t.is(plugins[1], htmlExpected);
});

test('create dev config to return when only favPath is defined', t => {
	const config = {
		favPath,
		manifestDetails,
		"serviceWorker": false
	};
	const { plugins } = createDevConfig(config);
	t.is(plugins.length, 1);
	t.is(plugins[0], fpExpected);
});

test('create dev config to return empty when both are sent', t => {
	const config = {
		favPath,
		manifestDetails,
		"serviceWorker": true
	};
	const { plugins } = createDevConfig(config);
	t.is(plugins.length, 3);
	t.is(plugins[0], swExpected);
	t.is(plugins[1], htmlExpected);
	t.is(plugins[2], fpExpected);
});
// Removed Existing manifest testing.
test('create dev config when serviceWorker, favPath, manifestDetails, outputDir are sent and new manifest file is created', t => {
	const config = {
		favPath,
		manifestDetails,
		outputDir,
		"serviceWorker": true
	};
	const { plugins } = createDevConfig(config);
	t.is(plugins.length, 3);
	t.is(plugins[0], swExpected);
	t.is(plugins[1], htmlExpected);
	t.is(plugins[2], fpExpected);
});

test('create dev config to return empty when config is empty', t => t.is(createDevConfig({}).plugins.length, 0));
