'use strict';

const chai = require('chai');
const mock = require('mock-fs');
const config = require('./config');

describe('getConfig()', () => {
	afterEach(mock.restore);
	
	it('Loads bitbucket config from .bitbucket-toolboxrc.json and only applies missing defaults', () => {
		mock({
			'.bitbucket-toolboxrc.json': `{
				"bitbucket": {
					"repoSlug": "<REPO SLUG>",
					"repoUser": "<REPO USER>"
				}
			}`
		});
		const expected = {
			bitbucket: {
				repoSlug: '<REPO SLUG>',
				repoUser: '<REPO USER>',
			},
			messageIdentifier: '.:.',
		};
		chai
			.expect(config.getConfig())
			.to.deep.equal(expected);
	});	

	it('Loads messageIdentifier config .bitbucket-toolboxrc.json and only applies missing defaults', () => {
		mock({
			'.bitbucket-toolboxrc.json': `{
				"messageIdentifier": "apple"
			}`
		});
		const expected = {
			bitbucket: {},
			messageIdentifier: 'apple',
		};
		chai
			.expect(config.getConfig())
			.to.deep.equal(expected);
	});

	it('Returns defaults when no config is found', () => {
		const expected = {
			bitbucket: {},
			messageIdentifier: '.:.',
		};
		chai
			.expect(config.getConfig())
			.to.deep.equal(expected);
	});	

	it('should throw an error when invalid JSON', () => {
		mock({
			'.bitbucket-toolboxrc.json': `{
				[invalid]
			}`
		});
		chai.expect(config.getConfig).to.throw('.bitbucket-toolboxrc.json must be valid JSON.');
	});
});
