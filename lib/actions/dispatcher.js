'use strict';

const { ACTION_COMMENTS, ACTION_COMMENT, ACTION_SCRIPT } = require('./constants');

const comments = require('./comments');
const comment = require('./comment');
const script = require('./script');

const { highlightText } = require('../colors');

module.exports = {
	dispatchAction,
};

function dispatchAction(action, options) {
	const actionDispatcher = getActionDispatcher(action);
	return actionDispatcher(options);
}

function getActionDispatcher(action) {
	const actions = {
		[ACTION_COMMENTS]: comments.executeCommentsAction,
		[ACTION_COMMENT]: comment.executeCommentAction,
		[ACTION_SCRIPT]: script.executeScriptAction,
	};
	return (
		actions[action] ||
		function defaultAction() {
			throw new Error(`Unknown action ${highlightText(action)}`);
		}
	);
}
