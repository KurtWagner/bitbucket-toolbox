#!/usr/bin/env node
'use strict';

const logger = require('../lib/logger');
const { getConfig } = require('../lib/config');
const { getArgs } = require('../lib/args');
const { getCredentialsFromArgs } = require('../lib/credentials');
const { dispatchAction } = require('../lib/actions');

const { name, version } = require('../package.json');
logger.title(`${name} ${version}`);

try {
	const config = getConfig();
	const { action, args } = getArgs(process.argv);
	const credentials = getCredentialsFromArgs(args);

	dispatchAction(action, { config, args, credentials, argv: process.argv })
		.then(() => {
			logger.success(`Running "${action}"`);
			logger.log('Done.');
		})
		.catch(handleError);
} catch (e) {
	handleError(e);
}

function handleError({ message }) {
	logger.error(message);
	process.exit(1);
}
