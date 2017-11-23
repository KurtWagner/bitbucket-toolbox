'use strict';

const {ChangedChunks} = require('../git');

const HTTP_OK = 200;
const constants = require('./constants');

class BitbucketPullRequest {
	constructor({backend, repository, pullRequestId}) {
		this.repository = repository;
		this.pullRequestId = pullRequestId;
		this._backend = backend;
	}
	
	getChangedChunks() {
		return this._backend.request('get', `${constants.API_2_BASE}/repositories/${this.repository.repoUser}/${this.repository.repoSlug}/pullrequests/${this.pullRequestId}/diff`)
		.then(parseChangedChunksResponse);
	}
	
	deleteComments(...ids) {
		const pullRequest = this;
		
		const promises = [];
		ids.forEach((id) => {
			promises.push(deleteComment(id));
		});
		return require('q').all(promises).then((parts) => {
			const errors = [];
			parts.forEach(({ statusCode, body }) => {
				if (statusCode !== HTTP_OK) {
					errors.push(body);
				}
			});
			return {
				errors: errors,
			};
		});
		
		function deleteComment(id) {
			return pullRequest._backend.request('delete', `${constants.API_1_BASE}/repositories/${pullRequest.repository.repoUser}/${pullRequest.repository.repoSlug}/pullrequests/${pullRequest.pullRequestId}/comments/${id}`);
		}
	}
	
	getComments() {
		const pullRequest = this;
		
		// kick off the first pages request
		const allComments = [];
		const url = `${constants.API_2_BASE}/repositories/${this.repository.repoUser}/${this.repository.repoSlug}/pullrequests/${this.pullRequestId}/comments`;
		return pullRequest._backend.request('get', url)
		                           .then(gotComments);
						
		function gotComments({statusCode, body}) {
			if (statusCode !== HTTP_OK) { return null; }
			
			const bodyResponse = JSON.parse(body);
	
			// track all comment values
			if (bodyResponse.values) {
				allComments.push(...bodyResponse.values);
			}
			// if we're given a next url we will continue until that page
			// otherwise return all the comments we've collected!
			if (bodyResponse.next) {
				return pullRequest._backend.request('get', bodyResponse.next)
				                           .then(gotComments);
			} else {
				return allComments;
			}
		}
	}
	
	addComment(comment) {		
		const url = `${constants.API_1_BASE}/repositories/${this.repository.repoUser}/${this.repository.repoSlug}/pullrequests/${this.pullRequestId}/comments`;
		
		// Line from is for unchanged and line to for changed
		// see: https://bitbucket.org/site/master/issues/13110/post-comment-on-a-commit-pull-request-api
		const lineParamKey = comment.changed ? 'line_to' : 'line_from';
		const line = comment.changed ? comment.newLine : comment.previousLine;
		
		// From https://answers.atlassian.com/questions/32977327/are-you-planning-on-offering-an-update-pull-request-comment-api
		// You can create inline comments with 1.0. Use the filename and line_from / line_to elements in the JSON request body, as per 
		
		return this._backend.request('post', url, {
			[lineParamKey]: line,
			filename: comment.fileName,
			content: comment.message,
		}).then(({statusCode, body}) => {
			if (statusCode !== HTTP_OK) { 
				console.error(body);
				return false;
			}
			return true;
		});
	}
}

function parseChangedChunksResponse({statusCode, body:diff = ''}) {
	if (statusCode != HTTP_OK) {
		return null;
	}
	return new ChangedChunks({ diff });
}

module.exports = {
	BitbucketPullRequest,
};

