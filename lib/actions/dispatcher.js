'use strict';

const {ACTION_COMMENTS} = require('./constants');
const {executeCommentsAction} = require('./comments');

const actions = {
	[ACTION_COMMENTS]: executeCommentsAction,
};

module.exports = {
	dispatchAction,
};

function dispatchAction(action, options) {
	const actionDispatcher = getActionDispatcher(action);
	return actionDispatcher(options);
}

function getActionDispatcher(action) {
	return actions[action] || function defaultAction() {
		throw new Error(`Unknown action ${action}`);
	};
}
