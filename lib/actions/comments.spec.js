'use strict';

const chai = require('chai');
const nock = require('nock');
const mock = require('mock-fs');

const { executeCommentsAction, _test } = require('./comments');
const { getPreviousCommentIds } = _test;

const HTTP_OK = 200;
const HTTP_CREATED = 201;

describe('Action Comments', () => {
	describe('executeCommentsAction', () => {
		afterEach(mock.restore);

		beforeEach(() => {
			nock('https://api.bitbucket.org/2.0')
				.get('/repositories/my-user/my-repo/pullrequests/10/diff')
				.reply(HTTP_OK, getDiff());
			nock('https://api.bitbucket.org/2.0')
				.get('/repositories/my-user/my-repo/pullrequests/10/comments')
				.reply(HTTP_OK, {});
			nock('https://api.bitbucket.org/2.0')
				.persist()
				.post('/repositories/my-user/my-repo/pullrequests/10/comments')
				.reply(HTTP_CREATED, {});
			nock('https://api.bitbucket.org/2.0')
				.get('/user')
				.reply(HTTP_OK, {
					uuid: 'my-current-username',
				});
		});

		const config = {
			bitbucket: {
				repoUser: 'my-user',
				repoSlug: 'my-repo',
			},
			messageIdentifier: '.:id:.',
		};
		const credentials = {
			bitbucket: {
				username: 'user1',
				password: 'pass1',
			},
		};
		const args = {
			pullRequestID: 10,
			checkstyleFilePaths: ['checkstyle.xml'],
		};

		it('returns success if no severities are configured', done => {
			mock({
				'checkstyle.xml': `
					<?xml version="1.0" encoding="utf-8"?>
					<checkstyle version="4.3">
					<file name="eslint.js">
						<error line="13" column="1" severity="critical" message=""/>
						<error line="14" column="1" severity="fatal" message=""/>
					</file>
					<file name="package.json">
						<error line="10" column="1" severity="info" message=""/>
						<error line="11" column="1" severity="warning" message=""/>
						<error line="12" column="1" severity="error" message=""/>
					</file>
					</checkstyle>
				`,
			});
			executeCommentsAction({
				args: Object.assign({}, args, {
					failOnSeverity: [],
				}),
				config,
				credentials,
			})
				.then(() => done())
				.catch(({ message }) => done(message));
		});

		it('returns error if single severity is hit', done => {
			mock({
				'checkstyle.xml': `
					<?xml version="1.0" encoding="utf-8"?>
					<checkstyle version="4.3">
					<file name="eslint.js">
						<error line="13" column="1" severity="critical" message=""/>
						<error line="14" column="1" severity="fatal" message=""/>
					</file>
					<file name="package.json">
						<error line="10" column="1" severity="info" message=""/>
						<error line="11" column="1" severity="warning" message=""/>
						<error line="12" column="1" severity="error" message=""/>
					</file>
					</checkstyle>
				`,
			});
			executeCommentsAction({
				args: Object.assign({}, args, {
					failOnSeverity: ['error'],
				}),
				config,
				credentials,
			})
				.then(() => done('expected error severity'))
				.catch(({ message }) => {
					chai.expect(message).to.equal('Severities hit: error');
					done();
				});
		});

		it('returns error if multiple severities are hit', done => {
			mock({
				'checkstyle.xml': `
					<?xml version="1.0" encoding="utf-8"?>
					<checkstyle version="4.3">
					<file name="package.json">
						<error line="10" column="1" severity="info" message=""/>
						<error line="11" column="1" severity="warning" message=""/>
						<error line="12" column="1" severity="error" message=""/>
					</file>
					</checkstyle>
				`,
			});

			executeCommentsAction({
				args: Object.assign({}, args, {
					failOnSeverity: ['error', 'warning'],
				}),
				config,
				credentials,
			})
				.then(() => done('expected error severity'))
				.catch(({ message }) => {
					chai.expect(message).to.equal('Severities hit: error, warning');
					done();
				});
		});
	});
	describe('when calling getPreviousCommentIds', () => {
		const currentUser = { uuid: 'bob' };
		const messageIdentifier = '.:id:.';

		it('ignores deleted comments', () => {
			const expected = [1];
			const got = getPreviousCommentIds({
				currentUser,
				existingComments: [
					{
						id: 1,
						deleted: false,
						user: { uuid: currentUser.uuid },
						content: { raw: `My message ${messageIdentifier}` },
					},
					{
						id: 2,
						deleted: true,
						user: { uuid: currentUser.uuid },
						content: { raw: `My message ${messageIdentifier}` },
					},
				],
				messageIdentifier,
			});
			chai.expect(got).deep.equal(expected);
		});
		it('ignores comments without a "user"', () => {
			const expected = [1];
			const got = getPreviousCommentIds({
				currentUser,
				existingComments: [
					{
						id: 1,
						deleted: false,
						user: { uuid: currentUser.uuid },
						content: { raw: `My message ${messageIdentifier}` },
					},
					{
						id: 2,
						deleted: false,
						user: null,
						content: { raw: `My message ${messageIdentifier}` },
					},
				],
				messageIdentifier,
			});
			chai.expect(got).deep.equal(expected);
		});
		it('only returns comments that match the user and identifier', () => {
			const expected = [1];
			const got = getPreviousCommentIds({
				currentUser,
				existingComments: [
					{
						id: 1,
						deleted: false,
						user: { uuid: currentUser.uuid },
						content: { raw: `My message ${messageIdentifier}` },
					},
					{
						id: 2,
						deleted: false,
						user: { uuid: currentUser.uuid },
						content: { raw: `My message .:otherId:.` },
					},
					{
						id: 2,
						deleted: false,
						user: { uuid: `Other ${currentUser.uuid}` },
						content: { raw: `My message ${messageIdentifier}` },
					},
				],
				messageIdentifier,
			});
			chai.expect(got).deep.equal(expected);
		});
	});
});

function getDiff() {
	return `
diff --git a/package.json b/package.json
index a01fff5..c6020e4 100644
--- a/package.json
+++ b/package.json
@@ -10,14 +10,14 @@
	 "postinstall": "do something",
	 "preinstall": "do something else"
   },
+  "license": "MIT",
   "private": true,
-  "version": "6.0.0",
   "dependencies": {
	 "dependency-100": "1.0.0",
	 "dependency-101": "1.0.0"
   },
   "devDependencies": {
-    "dependency-1": "1.0.0",
+    "dependency-1": "1.0.1",
	 "dependency-2": "1.0.0",
	 "dependency-3": "1.0.0",
	 "dependency-4": "1.0.0",
`;
}
