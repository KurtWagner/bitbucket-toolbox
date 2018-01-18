'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG_FILENAMES = ['.bitbucket-toolbox.json', '.bitbucket-toolbox.js'];
const DEFAULT_CONFIG = {
	messageIdentifier: '.:.',
	bitbucket: {},
};

module.exports = {
	getConfig,
	CONFIG_FILENAME: CONFIG_FILENAMES[0],
};

function getConfig() {
	const validConfigs = [];
	CONFIG_FILENAMES.forEach(filename => {
		const configFilePath = path.resolve(process.cwd(), filename);
		if (fs.existsSync(configFilePath)) {
			validConfigs.push(configFilePath);
		}
	});
	if (validConfigs.length === 0) {
		return Object.assign({}, DEFAULT_CONFIG);
	}
	if (validConfigs.length > 1) {
		throw new Error(`Ambiguous configurations. Please only have one: ${CONFIG_FILENAMES.join(', ')}`);
	}

	const configFilePath = validConfigs[0];
	let config;

	if (configFilePath.endsWith('.json')) {
		const contents = fs.readFileSync(configFilePath);
		try {
			config = JSON.parse(contents);
		} catch (e) {
			throw new Error(`${path.basename(configFilePath)} must be valid JSON.`);
		}
	} else {
		config = require(configFilePath);
	}

	return Object.assign({}, DEFAULT_CONFIG, config);
}
