'use strict';

const Q = require('q');

const {BitbucketClient} = require('../bitbucket');
const {loadAndroidLintResults, loadCheckstyleResults} = require('../loaders');

module.exports = {
	executeCommentsAction,
	_test: {
		getPreviousCommentIds, /* testing only, should probably do better than this but for now will do */
	},
};

function executeCommentsAction({args, config, credentials}) {
	
	const {
		repoUser = config.bitbucket.repoUser,
		repoSlug = config.bitbucket.repoSlug,
		messageIdentifier = config.messageIdentifier,
		pullRequestID,
		checkstyleFilePaths = [],
		androidLintFilePaths = [],
	} = args;

	if (!repoSlug || !repoUser || !pullRequestID) {
		console.error('Required repo slug, repo user and pull request id');
		process.exit(1);
	}

	if (checkstyleFilePaths.length === 0 && androidLintFilePaths.length === 0) {
		console.error('Please supply --checkstyle or --android-lint result files.');
		process.exit(1);
	}

	if (checkstyleFilePaths.length > 0 && androidLintFilePaths.length > 0) {
		console.error('Please supply either --checkstyle or --android-lint result files not both.');
		process.exit(1);
	}


	const client = new BitbucketClient({
		username: credentials.bitbucket.username,
		password: credentials.bitbucket.password,
	});
	const pullRequest = client.repository(repoUser, repoSlug).pullRequest(pullRequestID);

	const loader = checkstyleFilePaths.length > 0 ? loadCheckstyleResults : loadAndroidLintResults;
	const loaderFilePaths = checkstyleFilePaths.length > 0 ? checkstyleFilePaths : androidLintFilePaths;

	console.log('Getting comments, diff and current user');
	loader(loaderFilePaths)
		.then(checkstyle => {
			return Q.all([
				Q(checkstyle),
				pullRequest.getChangedChunks(),
				pullRequest.getComments(),
				client.getCurrentUser(),
			]);
		})
		.then(([linterResult, changedChunks, existingComments, currentUser]) => {
			const comments = getComments({ changedChunks, linterResult, messageIdentifier });
			const currentUserComments = getPreviousCommentIds({ currentUser, existingComments, messageIdentifier });
			return {pullRequest, comments, currentUserComments};
		})
		.then(startProcessing)
		.catch(error => {
			console.error(error);
			process.exit();
		});
}

function startProcessing({pullRequest, comments, currentUserComments}) {
	console.log(`Deleting ${currentUserComments.length} comments ${currentUserComments.join(', ')}`);
	pullRequest.deleteComments(...currentUserComments).then(({ errors }) => {
		if (errors.length > 0) {
			console.error('Failed to remove comments');
			console.error(errors);
		} else {
			console.log(`Adding ${comments.length} comments`);
			const addCommentPromises = [];
			comments.forEach(comment => {
				const addCommentPromise = pullRequest.addComment(comment);
				addCommentPromises.push(addCommentPromise);
			});
			Q
				.all(addCommentPromises)
				.finally(() => {
					console.log('Done.');
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
		return comment.user.username === currentUser.username && comment.content.raw.endsWith(messageIdentifier);
	}
}

