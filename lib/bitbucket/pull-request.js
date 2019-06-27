'use strict';

const { ChangedChunks } = require('../git');

const isStatusCodeSuccess = code => code >= 200 && code < 300;
const constants = require('./constants');

class BitbucketPullRequest {
	constructor({ backend, repository, pullRequestId }) {
		this.repository = repository;
		this.pullRequestId = pullRequestId;
		this._backend = backend;
	}

	getChangedChunks() {
		return this._backend
			.request(
				'get',
				`${constants.API_2_BASE}/repositories/${this.repository.repoUser}/${this.repository
					.repoSlug}/pullrequests/${this.pullRequestId}/diff`
			)
			.then(parseChangedChunksResponse);
	}

	getSelf() {
		return this._backend
			.request(
				'get',
				`${constants.API_2_BASE}/repositories/${this.repository.repoUser}/${this.repository
					.repoSlug}/pullrequests/${this.pullRequestId}`
			)
			.then(parsePullRequestResponse);

		function parsePullRequestResponse({ statusCode, body }) {
			if (!isStatusCodeSuccess(statusCode)) {
				return null;
			}
			return JSON.parse(body);
		}
	}

	deleteComments(...ids) {
		const pullRequest = this;

		const promises = [];
		ids.forEach(id => {
			promises.push(deleteComment(id));
		});
		return require('q')
			.all(promises)
			.then(parts => {
				const errors = [];
				parts.forEach(({ statusCode, body }) => {
					if (!isStatusCodeSuccess(statusCode)) {
						errors.push(body);
					}
				});
				return {
					errors: errors,
				};
			});

		function deleteComment(id) {
			return pullRequest._backend.request(
				'delete',
				`${constants.API_2_BASE}/repositories/${pullRequest.repository.repoUser}/${pullRequest.repository
					.repoSlug}/pullrequests/${pullRequest.pullRequestId}/comments/${id}`
			);
		}
	}

	getComments() {
		const pullRequest = this;

		// kick off the first pages request
		const allComments = [];
		const url = `${constants.API_2_BASE}/repositories/${this.repository.repoUser}/${this.repository
			.repoSlug}/pullrequests/${this.pullRequestId}/comments`;
		return pullRequest._backend.request('get', url).then(gotComments);

		function gotComments({ statusCode, body }) {
			if (!isStatusCodeSuccess(statusCode)) {
				return null;
			}

			const bodyResponse = JSON.parse(body);

			// track all comment values
			if (bodyResponse.values) {
				allComments.push(...bodyResponse.values);
			}
			// if we're given a next url we will continue until that page
			// otherwise return all the comments we've collected!
			if (bodyResponse.next) {
				return pullRequest._backend.request('get', bodyResponse.next).then(gotComments);
			} else {
				return allComments;
			}
		}
	}

	addComment(comment) {
		const url = `${constants.API_2_BASE}/repositories/${this.repository.repoUser}/${this.repository
			.repoSlug}/pullrequests/${this.pullRequestId}/comments`;

		// Line from is for unchanged and line to for changed
		const lineParamKey = comment.changed ? 'to' : 'from';
		const line = comment.changed ? comment.newLine : comment.previousLine;

		return this._backend
			.request('post', url, {
				inline: {
					[lineParamKey]: line,
					path: comment.fileName,
				},
				content: { raw: comment.message },
			})
			.then(({ statusCode, body }) => {
				if (!isStatusCodeSuccess(statusCode)) {
					console.error(body);
					return false;
				}
				return true;
			});
	}
}

function parseChangedChunksResponse({ statusCode, body: diff = '' }) {
	if (!isStatusCodeSuccess(statusCode)) {
		return null;
	}
	return new ChangedChunks({ diff });
}

module.exports = {
	BitbucketPullRequest,
};
