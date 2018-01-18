'use strict';

const { BitbucketPullRequest } = require('./pull-request');
const constants = require('./constants');
const logger = require('../logger');
const icons = require('../icons');

const Q = require('q');

const HTTP_OK = 200;

class BitbucketRepository {
	constructor({ backend, repoUser, repoSlug }) {
		this.repoUser = repoUser;
		this.repoSlug = repoSlug;
		this._backend = backend;
	}

	pullRequest(id) {
		return new BitbucketPullRequest({
			backend: this._backend,
			repository: this,
			pullRequestId: id,
		});
	}

	pullRequests({ state = 'OPEN' } = {}) {
		const validStates = ['MERGED', 'SUPERSEDED', 'OPEN', 'DECLINED'];
		if (!validStates.includes(state)) {
			throw new Error(`pull request state "${state}" not valid. It must be: ${validStates.join(', ')}`);
		}

		const repository = this;
		const allPullrequests = [];

		// kick off the first pages request
		logger.log(`${icons.fetching()}  Fetching page 1/N of pull requests`);
		return this._backend
			.request(
				'get',
				`${constants.API_2_BASE}/repositories/${this.repoUser}/${this.repoSlug}/pullrequests?state=${state}`
			)
			.then(gotPullRequests)
			.then(addMetaToPullRequests);

		function gotPullRequests({ statusCode, body }) {
			if (statusCode !== HTTP_OK) {
				return null;
			}

			const bodyResponse = JSON.parse(body);

			// track all pull requests values
			if (bodyResponse.values) {
				allPullrequests.push(...bodyResponse.values);
			}
			// if we're given a next url we will continue until that page
			// otherwise return all the comments we've collected!
			if (bodyResponse.next) {
				logger.log(
					`${icons.fetching()}  Fetching page ${bodyResponse.page + 1}/${getTotalPages(bodyResponse)} of pull requests`
				);
				return repository._backend.request('get', bodyResponse.next).then(gotPullRequests);
			} else {
				return allPullrequests;
			}
		}

		function addMetaToPullRequests(pullRequests = []) {
			const bar = logger.logProgress(`${icons.learning()}  Learning about ${pullRequests.length} pull requests`, {
				total: pullRequests.length,
			});

			const loadingChunks = [];
			for (const pullRequest of pullRequests) {
				loadingChunks.push(
					getPullRequestMeta(pullRequest.id).then(({ changedChunks, fullPullRequestValue }) => {
						bar.tick();
						return Object.assign({}, pullRequest, fullPullRequestValue, {
							changedChunks,
						});
					})
				);
			}
			return Q.all(loadingChunks).then(updatedPullRequests => {
				return updatedPullRequests;
			});
		}

		// in list we don't get the diff or reviewers so we're making a separate request for full details
		function getPullRequestMeta(pullRequestId) {
			const pullRequest = new BitbucketPullRequest({
				backend: repository._backend,
				repository: repository,
				pullRequestId: pullRequestId,
			});
			return Q.all([
				pullRequest.getChangedChunks(),
				pullRequest.getSelf(),
			]).spread((changedChunks, fullPullRequestValue) => {
				return { changedChunks, fullPullRequestValue };
			});
		}
	}
}

module.exports = {
	BitbucketRepository,
};

function getTotalPages(bodyResponse) {
	return Math.ceil(bodyResponse.size / bodyResponse.pagelen);
}
