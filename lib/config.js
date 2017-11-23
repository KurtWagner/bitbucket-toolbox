'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG_FILENAME = '.bitbucket-toolbox.json';
const DEFAULT_CONFIG = {
	messageIdentifier: '.:.',
	bitbucket: {},
};

module.exports = {
	getConfig,
	CONFIG_FILENAME,
};

function getConfig() {	
	const configFilePath = path.join(process.cwd(), CONFIG_FILENAME);
	if (!fs.existsSync(configFilePath)) {		
		return Object.assign({}, DEFAULT_CONFIG);
	}
	
	let config;
	const contents = fs.readFileSync(configFilePath);
	try {
		config = JSON.parse(contents);
	} catch (e) {
		throw new Error(`${CONFIG_FILENAME} must be valid JSON.`);
	}
	
	return Object.assign({}, DEFAULT_CONFIG, config);
}