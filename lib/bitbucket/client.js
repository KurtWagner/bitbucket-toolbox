'use strict';

const constants = require('./constants');
const {BitbucketBackend} = require('./backend');
const {BitbucketRepository} = require('./repository');

class BitbucketClient {
	constructor({backend, username, password}) {
		this._backend = backend || new BitbucketBackend({username, password});
	}
	
	repository(repoUser, repoSlug) {
		return new BitbucketRepository({
			backend: this._backend,
			repoUser,
			repoSlug,
		});
	}
	
	getCurrentUser() {
		return this._backend.request('get', `${constants.API_2_BASE}/user`).then(({statusCode, body}) => {
			if (statusCode !== 200) { return null; }
			return JSON.parse(body);
		});
	}
}

module.exports = {
	BitbucketClient,
};
