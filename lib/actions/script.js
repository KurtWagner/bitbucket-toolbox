'use strict';

const Q = require('q');

const { highlightText } = require('../colors');
const logger = require('../logger');
const { BitbucketClient } = require('../bitbucket');
const { ACTION_SCRIPT } = require('./constants');

const SCRIPT_TYPES = {
	openPullRequests: openPullRequests,
};

module.exports = {
	executeScriptAction,
};

function executeScriptAction(actionDetails) {
	const { argv, config } = actionDetails;
	const { scriptRunner, scriptConfig } = getAndVerifyScript({ argv, config });

	return scriptRunner(actionDetails).then(result => {
		return Q(scriptConfig.resolve(result));
	});
}

function getAndVerifyScript({ config, argv }) {
	if (!config.scripts) {
		throw new Error(`Missing "scripts" in configuration file.`);
	}

	const scriptName = argv[argv.findIndex(arg => arg === ACTION_SCRIPT) + 1];
	if (!scriptName) {
		throw new Error(`Missing script name. e.g, "bitbucket-toolbox ${ACTION_SCRIPT} <scriptName>"`);
	}

	const scriptConfig = config.scripts[scriptName];
	if (!scriptConfig) {
		throw new Error(`No script configuration for ${highlightText(scriptName)}`);
	}
	if (!scriptConfig.type) {
		throw new Error(`Script ${highlightText(scriptName)} is missing a "type". ${getAvailableScriptTypesText()}`);
	}
	if (!scriptConfig.resolve) {
		throw new Error(`Script ${highlightText(scriptName)} is missing a "resolve" function.`);
	}

	const scriptRunner = SCRIPT_TYPES[scriptConfig.type];
	if (!scriptRunner) {
		throw new Error(
			`Script ${highlightText(scriptName)} has an unknown type ${highlightText(
				scriptConfig.type
			)}. ${getAvailableScriptTypesText()}`
		);
	}

	return { scriptConfig, scriptRunner };
}

function openPullRequests({ args, config, credentials }) {
	const { repoUser = config.bitbucket.repoUser, repoSlug = config.bitbucket.repoSlug } = args;

	if (!repoSlug || !repoUser) {
		throw new Error('Missing required repo slug and repo user');
	}

	const client = new BitbucketClient({
		username: credentials.bitbucket.username,
		password: credentials.bitbucket.password,
	});

	logger.step(1, 2, `Loading open pull requests`);
	return client
		.repository(repoUser, repoSlug)
		.pullRequests()
		.then(pullRequests => {
			logger.step(2, 2, `Resolving script`);
			return { pullRequests };
		});
}

function getAvailableScriptTypesText() {
	return `Valid types: ${Object.keys(SCRIPT_TYPES).join(', ')}`;
}
