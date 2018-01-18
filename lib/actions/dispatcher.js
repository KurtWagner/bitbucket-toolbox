'use strict';

const { ACTION_COMMENTS, ACTION_SCRIPT } = require('./constants');

const { executeCommentsAction } = require('./comments');
const { executeScriptAction } = require('./script');

const { highlightText } = require('../colors');

const actions = {
	[ACTION_COMMENTS]: executeCommentsAction,
	[ACTION_SCRIPT]: executeScriptAction,
};

module.exports = {
	dispatchAction,
};

function dispatchAction(action, options) {
	const actionDispatcher = getActionDispatcher(action);
	return actionDispatcher(options);
}

function getActionDispatcher(action) {
	return (
		actions[action] ||
		function defaultAction() {
			throw new Error(`Unknown action ${highlightText(action)}`);
		}
	);
}
