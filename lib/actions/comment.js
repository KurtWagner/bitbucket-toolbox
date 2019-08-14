'use strict';

module.exports = {
	executeCommentAction,
};

function executeCommentAction({ args, config, credentials }) {
	console.log(args, config, credentials);
	return Promise.resolve();
}
