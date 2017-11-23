'use strict';

const chai = require('chai');
const mock = require('mock-fs');
const {getConfig, CONFIG_FILENAME} = require('./config');

describe('getConfig()', () => {
	afterEach(mock.restore);
	
	it(`Loads bitbucket config from ${CONFIG_FILENAME} and only applies missing defaults`, () => {
		mock({
			[CONFIG_FILENAME]: `{
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
			.expect(getConfig())
			.to.deep.equal(expected);
	});	

	it(`Loads messageIdentifier config ${CONFIG_FILENAME} and only applies missing defaults`, () => {
		mock({
			[CONFIG_FILENAME]: `{
				"messageIdentifier": "apple"
			}`
		});
		const expected = {
			bitbucket: {},
			messageIdentifier: 'apple',
		};
		chai
			.expect(getConfig())
			.to.deep.equal(expected);
	});

	it('Returns defaults when no config is found', () => {
		const expected = {
			bitbucket: {},
			messageIdentifier: '.:.',
		};
		chai
			.expect(getConfig())
			.to.deep.equal(expected);
	});	

	it('should throw an error when invalid JSON', () => {
		mock({
			[CONFIG_FILENAME]: `{
				[invalid]
			}`
		});
		chai.expect(getConfig).to.throw(`${CONFIG_FILENAME} must be valid JSON.`);
	});
});
