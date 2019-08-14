'use strict';

module.exports = {
	makePullRequest,
};

function makePullRequest({ client, user, slug, id }) {
	if (!slug || !user || !id) {
		throw new Error('Required repo slug, repo user and pull request id');
	}
	return client.repository(user, slug).pullRequest(id);
}
