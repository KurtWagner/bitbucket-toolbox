'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
	getCredentialsFromArgs,
};

/**
 * Returns credentials information for the given process args. If a credentials
 * file path is not passed in, a username and password is required.
 *
 * @param {object} processArgs
 * @param {string} [processArgs.username] - Bitbucket username
 * @param {string} [processArgs.username] - Bitbucket password
 * @param {string} [processArgs.credentials] - Path to JSON credentials file
 */
function getCredentialsFromArgs(processArgs) {
	const loadedCredentials = loadCredentials(processArgs);
	const {bitbucket} = loadedCredentials;
	if (!bitbucket || !bitbucket.username || !bitbucket.password) {
		throw new Error('Missing username and password, or credentials file path.');
	}
	return loadedCredentials;
}

function loadCredentials(processArgs) {
	if (processArgs.credentials) {
		return getCredentials(processArgs.credentials);
	}
	return {
		bitbucket: {
			username: processArgs.username,
			password: processArgs.password,
		},
	};
}

function getCredentials(credentialsFilePath) {
	const relativeCredentialsFilePath = path.join(process.cwd(), credentialsFilePath);
		
	if (!fs.existsSync(relativeCredentialsFilePath)) {
		throw new Error(`Missing ${credentialsFilePath} configuration file.`);
	}
	
	let credentials;
	const contents = fs.readFileSync(relativeCredentialsFilePath);
	try {
		credentials = JSON.parse(contents);
	} catch (e) {
		throw new Error(`${credentialsFilePath} must be valid JSON.`);
	}
	
	verifyConfiguration(credentials, credentialsFilePath);
	return credentials;
}

function verifyConfiguration(credentials, credentialsFilePath) {
	if (!credentials.bitbucket) {
		throw new Error(`Missing "bitbucket.username" and "bitbucket.password" in ${credentialsFilePath}`);
	}
	if (!credentials.bitbucket.username) {
		throw new Error(`Missing "bitbucket.username" in ${credentialsFilePath}`);
	}
	if (!credentials.bitbucket.password) {
		throw new Error(`Missing "bitbucket.password" in ${credentialsFilePath}`);
	}
}
