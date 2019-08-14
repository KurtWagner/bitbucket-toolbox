'use strict';

const { makePullRequest } = require('../factory/pull-request');
const { BitbucketClient } = require('../bitbucket');

module.exports = {
	executeCommentAction,
};

function executeCommentAction({ args, config, credentials }) {
	const {
		repoUser = config.bitbucket.repoUser,
		repoSlug = config.bitbucket.repoSlug,
		messageIdentifier = config.messageIdentifier,
		pullRequestID,
		commentFile,
	} = args;
	const client = new BitbucketClient({
		username: credentials.bitbucket.username,
		password: credentials.bitbucket.password,
	});
	const pullRequest = makePullRequest({ client, user: repoUser, slug: repoSlug, id: pullRequestID });
	console.log(credentials, pullRequest, messageIdentifier, commentFile);
	return Promise.resolve();
}
