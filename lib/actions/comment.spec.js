'use strict';

const chai = require('chai');
const nock = require('nock');

const { executeCommentAction } = require('./comment');

const HTTP_CREATED = 201;

describe('Action Comment', () => {
	describe('executeCommentAction', () => {
		let config, credentials, args, postCommentNock;
		beforeEach(() => {
			config = {
				bitbucket: {
					repoUser: 'my-user',
					repoSlug: 'my-repo',
				},
			};
			credentials = {
				bitbucket: {
					username: 'user1',
					password: 'pass1',
				},
			};
			args = {
				pullRequestID: 10,
				commentMessage: 'foo bar',
			};
			postCommentNock = nock('https://api.bitbucket.org/2.0')
				.post('/repositories/my-user/my-repo/pullrequests/10/comments')
				.once()
				.reply(HTTP_CREATED, {});
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('returns error if there are no comments to post', done => {
			delete args.commentMessage;
			executeCommentAction({
				args,
				config,
				credentials,
			})
				.then(() => done('expected error when there is no comment message to post'))
				.catch(({ message }) => {
					chai.expect(message).to.equal('No comment to post onto pull request');
					chai.expect(postCommentNock.isDone(), 'Request should not be called').to.be.false;
					done();
				});
		});

		it('returns success when posting comment with all args', done => {
			executeCommentAction({
				args,
				config,
				credentials,
			})
				.then(() => {
					chai.expect(postCommentNock.isDone(), 'Request should have been called once').to.be.true;
					done();
				})
				.catch(({ message }) => {
					done(message);
				});
		});
	});
});
