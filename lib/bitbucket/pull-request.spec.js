'use strict';

const sinon = require('sinon');
const chai = require('chai');

const { BitbucketBackend } = require('./backend');
const { BitbucketRepository } = require('./repository');

const constants = require('./constants');
const request = require('request');

describe('GIVEN a pull request', () => {
	var pullRequest;

	beforeEach(() => {
		const backend = new BitbucketBackend({
			username: 'my-username',
			password: 'my-password',
		});

		sinon.replace(request, 'post', sinon.fake.returns());

		pullRequest = new BitbucketRepository({
			repoSlug: 'my-repo',
			repoUser: 'my-repo-user',
			backend: backend,
		}).pullRequest(1011);
	});

	afterEach(() => {
		sinon.restore();
	});

	describe('WHEN calling addComment with unchanged', () => {
		it('THEN the backend talks to bitbucket API with line_from', () => {
			pullRequest.addComment({
				changed: false,
				previousLine: 100,
				fileName: 'package.json',
				message: 'Test message',
			});
			chai.assert(request.post.calledOnce);

			const expectedUrl = `${constants.API_2_BASE}/repositories/my-repo-user/my-repo/pullrequests/1011/comments`;
			const [{ body, url, auth }] = request.post.getCall(0).args;
			chai.expect(url).to.equal(expectedUrl);
			chai.expect(body).to.deep.equal({
				inline: {
					from: 100,
					path: 'package.json',
				},
				content: { raw: 'Test message' },
			});
			chai.expect(auth).to.deep.equal({
				user: 'my-username',
				pass: 'my-password',
				sendImmediately: true,
			});
		});
	});

	describe('WHEN calling addComment with changed', () => {
		it('THEN the backend talks to bitbucket API with line_to', () => {
			pullRequest.addComment({
				changed: true,
				newLine: 101,
				fileName: 'package.json',
				message: 'Test message',
			});
			chai.assert(request.post.calledOnce);

			const expectedUrl = `${constants.API_2_BASE}/repositories/my-repo-user/my-repo/pullrequests/1011/comments`;
			const [{ body, url, auth }] = request.post.getCall(0).args;
			chai.expect(url).to.equal(expectedUrl);
			chai.expect(body).to.deep.equal({
				inline: {
					to: 101,
					path: 'package.json',
				},
				content: { raw: 'Test message' },
			});
			chai.expect(auth).to.deep.equal({
				user: 'my-username',
				pass: 'my-password',
				sendImmediately: true,
			});
		});
	});
});
