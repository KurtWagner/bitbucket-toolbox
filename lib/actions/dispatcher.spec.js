'use strict';

const sinon = require('sinon');
const chai = require('chai');

const comments = require('./comments');
const comment = require('./comment');
const script = require('./script');

const { ACTION_COMMENTS, ACTION_COMMENT, ACTION_SCRIPT } = require('./constants');

const {dispatchAction} = require('./dispatcher');

describe('GIVEN some action options', () => {
	afterEach(() => {
		sinon.restore();
	});

	describe('WHEN calling dispatchAction with comments action', () => {
		beforeEach(() => {
			sinon.stub(comments, 'executeCommentsAction').returns();
			dispatchAction(ACTION_COMMENTS, {some: 'comments'});
		});
		it('THEN comments action is executed with given options', () => {
			chai.assert(comments.executeCommentsAction.calledOnce);
			chai.expect(comments.executeCommentsAction.getCall(0).args[0]).to.deep.equal({some: 'comments'});
		});
	});

	describe('WHEN calling dispatchAction with comment action', () => {
		beforeEach(() => {
			sinon.stub(comment, 'executeCommentAction').returns();
			dispatchAction(ACTION_COMMENT, {some: 'comment'});
		});
		it('THEN comment action is executed with given options', () => {
			chai.assert(comment.executeCommentAction.calledOnce);
			chai.expect(comment.executeCommentAction.getCall(0).args[0]).to.deep.equal({some: 'comment'});
		});
	});

	describe('WHEN calling dispatchAction with script action', () => {
		beforeEach(() => {
			sinon.stub(script, 'executeScriptAction').returns();
			dispatchAction(ACTION_SCRIPT, {some: 'script'});
		});
		it('THEN script action is executed with given options', () => {
			chai.assert(script.executeScriptAction.calledOnce);
			chai.expect(script.executeScriptAction.getCall(0).args[0]).to.deep.equal({some: 'script'});
		});
	});

	describe('WHEN calling dispatchAction with unknown action', () => {
		it('THEN goes kaboom', () => {
			chai.assert.throws(() => dispatchAction('unknown', {}), /^Unknown action/);
		});
	});
});