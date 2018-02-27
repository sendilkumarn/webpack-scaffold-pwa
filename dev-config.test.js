const test = require('ava');
const createDevConfig = require('./dev-config');

const favPath = "test.js";
const swExpected = "new GenerateSW()";
const fpExpected = "new FaviconsWebpackPlugin('" + favPath + "')";

test('create dev config to return when serviceworker is true', t => {
	const { plugins } = createDevConfig(true);
	t.is(plugins.length, 1);
	t.is(plugins[0], swExpected);
});

test('create dev config to return when only favPath is defined', t => {
	const { plugins } = createDevConfig(false, favPath);
	t.is(plugins.length, 1);
	t.is(plugins[0], fpExpected);
});

test('create dev config to return empty when both are empty', t => t.is(createDevConfig().plugins.length, 0));

test('create dev config to return empty when both are sent', t => {
	const { plugins } = createDevConfig(true, favPath);
	t.is(plugins.length, 2);
	t.is(plugins[0], swExpected);
	t.is(plugins[1], fpExpected);
});
