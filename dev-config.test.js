const test = require('ava');
const createDevConfig = require('./dev-config');

const favPath = "test.js";
const ifNewManifest = {
	"hasManifest": false,
	"homePage": "index.html",
	"name": "test",
	"shortName": "test",
	"themeColor": "#ffffff"
};
const ifExistingManifest = {
	"hasManifest": true,
	"path": "/manifest.json"
};
const outputDir = "/dist";
const swExpected = "new GenerateSW()";
const fpExpected = "new FaviconsWebpackPlugin('" + favPath + "')";
const manifestExpected = "new CopyWebpackPlugin([{ from: '/manifest.json', to: '" + outputDir + "'}])";

test('create dev config to return when serviceworker is true', t => {
	const config = {
		"serviceWorker": true
	};
	const { plugins } = createDevConfig(config);
	t.is(plugins.length, 1);
	t.is(plugins[0], swExpected);
});

test('create dev config to return when only favPath is defined', t => {
	const config = {
		favPath,
		"serviceWorker": false
	};
	const { plugins } = createDevConfig(config);
	t.is(plugins.length, 1);
	t.is(plugins[0], fpExpected);
});

test('create dev config to return empty when both are sent', t => {
	const config = {
		favPath,
		"serviceWorker": true
	};
	const { plugins } = createDevConfig(config);
	t.is(plugins.length, 2);
	t.is(plugins[0], swExpected);
	t.is(plugins[1], fpExpected);
});

test('create dev config to return when serviceWorker, favPath, manifestDetails, outputDir are sent and existing manifest file is used', t => {
	const config = {
		favPath,
		"manifestDetails": ifExistingManifest,
		outputDir,
		"serviceWorker": true
	};
	const { plugins } = createDevConfig(config);
	t.is(plugins.length, 3);
	t.is(plugins[0], swExpected);
	t.is(plugins[1], fpExpected);
	t.is(plugins[2], manifestExpected);
});

test('create dev config when serviceWorker, favPath, manifestDetails, outputDir are sent and new manifest file is created', t => {
	const config = {
		favPath,
		"manifestDetails": ifNewManifest,
		outputDir,
		"serviceWorker": true
	};
	const { plugins } = createDevConfig(config);
	t.is(plugins.length, 3);
	t.is(plugins[0], swExpected);
	t.is(plugins[1], fpExpected);
	t.is(plugins[2], manifestExpected);
});

test('create dev config to return empty when config is empty', t => t.is(createDevConfig().plugins.length, 0));
