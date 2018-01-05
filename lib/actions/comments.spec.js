'use strict';

const chai = require('chai');
const {_test} = require('./comments');

const {getPreviousCommentIds} = _test;

describe('Action Comments', () => {
	describe('when calling getPreviousCommentIds', () => {
		
		const currentUser = { username: 'bob' };
		const messageIdentifier = '.:id:.';
		
		it('ignores deleted comments', () => {
			const expected = [1];
			const got = getPreviousCommentIds({ 
				currentUser,
				existingComments: [{
					id: 1,
					deleted: false,
					user: { username: currentUser.username },
					content: { raw: `My message ${messageIdentifier}` },
				}, {
					id: 2,
					deleted: true,
					user: { username: currentUser.username },
					content: { raw: `My message ${messageIdentifier}` },
				}],
				messageIdentifier,
			});
			chai.expect(got).deep.equal(expected);
		});
		it('ignores comments without a "user"', () => {
			const expected = [1];
			const got = getPreviousCommentIds({ 
				currentUser,
				existingComments: [{
					id: 1,
					deleted: false,
					user: { username: currentUser.username },
					content: { raw: `My message ${messageIdentifier}` },
				}, {
					id: 2,
					deleted: false,
					user: null,
					content: { raw: `My message ${messageIdentifier}` },
				}],
				messageIdentifier,
			});
			chai.expect(got).deep.equal(expected);
		});
		it('only returns comments that match the user and identifier', () => {
			const expected = [1];
			const got = getPreviousCommentIds({ 
				currentUser,
				existingComments: [{
					id: 1,
					deleted: false,
					user: { username: currentUser.username },
					content: { raw: `My message ${messageIdentifier}` },
				}, {
					id: 2,
					deleted: false,
					user: { username: currentUser.username },
					content: { raw: `My message .:otherId:.` },
				}, {
					id: 2,
					deleted: false,
					user: { username: `Other ${currentUser.username}` },
					content: { raw: `My message ${messageIdentifier}` },
				}],
				messageIdentifier,
			});
			chai.expect(got).deep.equal(expected);
		});
	});
});
