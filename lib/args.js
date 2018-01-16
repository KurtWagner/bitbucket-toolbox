'use strict';

const path = require('path');
const {Command} = require('commander');

module.exports = {
	getArgs,
};

function getArgs(argv) {
	const packageDetails = require(path.join(__dirname, '..', 'package.json'));
	// we instantiate another commander to avoid leaky singleton
	var program = new Command();
	program
		.version(packageDetails.version)
		.option(
			'-c, --checkstyle <file>',
			'path to checkstyle report XML file. This argument can be used multiple times',
			collectFilePaths,
			[]
		)
		.option(
			'--android-lint <file>',
			'path to android lint XML report file. This argument can be used multiple times',
			collectFilePaths,
			[]
		)
		.option('--repo-user <repo-user>', 'owner of the repository')
		.option('--repo-slug <repo-slug>', 'repository name')
		.option('--pull-request <pull-request-id>', 'pull request ID', Number)
		.option('--credentials <credentials file>', 'path to credentials file')
		.option('--message-identifier <unique id for messages>', 'unique id for messages')
		.option('--username <bitbucket username>', 'Bitbucket username. Needed if credentials path not provided.')
		.option('--password <bitbucket password>', 'Bitbucket password. Needed if credentials path not provided.')
		.option('--fail-on-severity <severity>', 'e.g, critical, error, fatal, warning etc', collectSeverities, [])
		.parse(argv);

	const args = {
		checkstyleFilePaths: program.checkstyle,
		androidLintFilePaths: program.androidLint,
		repoUser: program.repoUser,
		repoSlug: program.repoSlug,
		pullRequestID: program.pullRequest,
		credentials: program.credentials,
		messageIdentifier: program.messageIdentifier,
		username: program.username,
		password: program.password,
		failOnSeverity: program.failOnSeverity.map(severity => severity.toLowerCase()),
	};
	return {
		args,
		action: argv[2],
	};

	function collectFilePaths(filePath, filePaths) {
		filePaths.push(filePath);
		return filePaths;
	}

	function collectSeverities(severity, severities) {
		severities.push(severity);
		return severities;
	}
}
