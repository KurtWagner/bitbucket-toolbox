#!/usr/bin/env node
'use strict';

const {getConfig} = require('../lib/config');
const {getArgs} = require('../lib/args');
const {getCredentialsFromArgs} = require('../lib/credentials');
const {dispatchAction} = require('../lib/actions');

try {
	const config = getConfig();
	const {action, args} = getArgs(process.argv);
	const credentials = getCredentialsFromArgs(args);
	
	dispatchAction(action, {config, args, credentials});

} catch (e) {
	console.error(e.message);
	process.exit(1);
}
