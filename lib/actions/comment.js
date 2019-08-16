'use strict';

const { makePullRequest } = require('../factory/pull-request');
const { BitbucketClient } = require('../bitbucket');
const logger = require('../logger');

module.exports = {
	executeCommentAction,
};

function executeCommentAction({ args, config, credentials }) {
	const {
		repoUser = config.bitbucket.repoUser,
		repoSlug = config.bitbucket.repoSlug,
		pullRequestID,
		commentMessage: message,
	} = args;

	if (!message) {
		return Promise.reject(new Error('No comment to post onto pull request'));
	}

	const client = new BitbucketClient({
		username: credentials.bitbucket.username,
		password: credentials.bitbucket.password,
	});
	const pullRequest = makePullRequest({ client, user: repoUser, slug: repoSlug, id: pullRequestID });

	logger.step(1, 1, `posting message to pull request id ${pullRequestID}`);
	logger.debug(`message: \n${message}`);
	return pullRequest.addComment({ message });
}
