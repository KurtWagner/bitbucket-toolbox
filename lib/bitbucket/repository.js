'use strict';

const {BitbucketPullRequest} = require('./pull-request');

class BitbucketRepository {
	constructor({backend, repoUser, repoSlug}) {
		this.repoUser = repoUser;
		this.repoSlug = repoSlug;
		this._backend = backend;
	}
	
	pullRequest(id) {
		return new BitbucketPullRequest({
			backend       : this._backend,
			repository    : this,
			pullRequestId : id,
		});
	}
}

module.exports = {
	BitbucketRepository,
};
