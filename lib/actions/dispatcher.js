'use strict';

const { ACTION_COMMENTS, ACTION_COMMENT, ACTION_SCRIPT } = require('./constants');

const { executeCommentsAction } = require('./comments');
const { executeCommentAction } = require('./comment');
const { executeScriptAction } = require('./script');

const { highlightText } = require('../colors');

const actions = {
	[ACTION_COMMENTS]: executeCommentsAction,
	[ACTION_COMMENT]: executeCommentAction,
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
