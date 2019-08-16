'use strict';

const Q = require('q');

const logger = require('../logger');
const { BitbucketClient } = require('../bitbucket');
const { makePullRequest } = require('../factory/pull-request');
const { loadAndroidLintResults, loadCheckstyleResults } = require('../loaders');
const TOTAL_STEPS = 3;

module.exports = {
	executeCommentsAction,
	_test: {
		getPreviousCommentIds /* testing only, should probably do better than this but for now will do */,
	},
};

function executeCommentsAction({ args, config, credentials }) {
	const {
		repoUser = config.bitbucket.repoUser,
		repoSlug = config.bitbucket.repoSlug,
		messageIdentifier = config.messageIdentifier,
		pullRequestID,
		checkstyleFilePaths = [],
		androidLintFilePaths = [],
		failOnSeverity = [],
	} = args;

	if (checkstyleFilePaths.length === 0 && androidLintFilePaths.length === 0) {
		throw new Error('Please supply --checkstyle or --android-lint result files.');
	}

	if (checkstyleFilePaths.length > 0 && androidLintFilePaths.length > 0) {
		throw new Error('Please supply either --checkstyle or --android-lint result files not both.');
	}

	const client = new BitbucketClient({
		username: credentials.bitbucket.username,
		password: credentials.bitbucket.password,
	});

	const pullRequest = makePullRequest({ client, user: repoUser, slug: repoSlug, id: pullRequestID });

	const loader = checkstyleFilePaths.length > 0 ? loadCheckstyleResults : loadAndroidLintResults;
	const loaderFilePaths = checkstyleFilePaths.length > 0 ? checkstyleFilePaths : androidLintFilePaths;

	logger.step(1, TOTAL_STEPS, 'Getting comments, diff and current user');
	return loader(loaderFilePaths)
		.then(checkstyle => {
			return Q.all([Q(checkstyle), pullRequest.getChangedChunks(), pullRequest.getComments(), client.getCurrentUser()]);
		})
		.then(([linterResult, changedChunks, existingComments, currentUser]) => {
			const comments = getComments({ changedChunks, linterResult, messageIdentifier });
			const currentUserComments = getPreviousCommentIds({ currentUser, existingComments, messageIdentifier });
			return { pullRequest, comments, currentUserComments, failOnSeverity };
		})
		.then(startProcessing);
}

function startProcessing({ pullRequest, comments, currentUserComments, failOnSeverity }) {
	logger.step(2, TOTAL_STEPS, `Deleting ${currentUserComments.length} comments ${currentUserComments.join(', ')}`);
	return pullRequest.deleteComments(...currentUserComments).then(({ errors }) => {
		if (errors.length > 0) {
			logger.error('Failed to remove comments');
			throw new Error(errors);
		} else {
			logger.step(3, TOTAL_STEPS, `Adding ${comments.length} comments`);
			const addCommentPromises = [];
			const hitSeverities = new Set();
			comments.forEach(comment => {
				const addCommentPromise = pullRequest.addComment(comment);

				if (failOnSeverity.includes(comment.severity)) {
					hitSeverities.add(comment.severity);
				}

				addCommentPromises.push(addCommentPromise);
			});
			return Q.all(addCommentPromises).then(() => {
				if (hitSeverities.size > 0) {
					throw new Error(`Severities hit: ${[...hitSeverities].sort().join(', ')}`);
				}
			});
		}
	});
}

function getComments({ linterResult, changedChunks, messageIdentifier }) {
	const comments = [];
	linterResult.forEach(({ fileName, errors }) => {
		errors.forEach(error => {
			const line = changedChunks.getLine(fileName, error.line);
			if (line) {
				comments.push({
					fileName: line.fileName,
					newLine: line.newLine,
					previousLine: line.previousLine,
					changed: line.changed,
					message: `${error.message} ${messageIdentifier}`,
					column: error.column,
					severity: error.severity,
				});
			}
		});
	});
	return comments;
}

function getPreviousCommentIds({ currentUser, existingComments, messageIdentifier }) {
	return existingComments.filter(isPreviousComment).map(comment => comment.id);

	function isPreviousComment(comment) {
		// we don't care for deleted or unknown author comments
		if (comment.deleted || !comment.user) {
			return false;
		}
		return comment.user.uuid === currentUser.uuid && comment.content.raw.endsWith(messageIdentifier);
	}
}
