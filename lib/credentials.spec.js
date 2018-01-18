'use strict';

const { highlightText } = require('./colors');
const chai = require('chai');
const mock = require('mock-fs');
const { getCredentialsFromArgs } = require('./credentials');

describe('getCredentials(credentialsFilePath)', () => {
	afterEach(mock.restore);

	it('throws an error if missing username', () => {
		mock({
			'credentials.json': `{
				"bitbucket": {
					"password": "<YOUR PASSWORD>"
				}
			}`,
		});
		chai
			.expect(() => {
				getCredentialsFromArgs({ credentials: 'credentials.json' });
			})
			.to.throw('Missing "bitbucket.username" in credentials.json');
	});

	it('throws an error if missing password', () => {
		mock({
			'credentials.json': `{
				"bitbucket": {
					"username": "<YOUR USERNAME>"
				}
			}`,
		});
		chai
			.expect(() => {
				getCredentialsFromArgs({ credentials: 'credentials.json' });
			})
			.to.throw('Missing "bitbucket.password" in credentials.json');
	});

	it('throws an error if missing username and password', () => {
		mock({
			'credentials.json': `{}`,
		});
		chai
			.expect(() => {
				getCredentialsFromArgs({ credentials: 'credentials.json' });
			})
			.to.throw('Missing "bitbucket.username" and "bitbucket.password" in credentials.json');
	});

	it('throws an error if credentials file is missing', () => {
		chai
			.expect(() => {
				getCredentialsFromArgs({ credentials: 'credentials.json' });
			})
			.to.throw(`Cannot find ${highlightText('credentials.json')} configuration file.`);
	});

	it('throws an error if credentials file is invalid JSON', () => {
		mock({
			'credentials.json': `{[invalid]}`,
		});
		chai
			.expect(() => {
				getCredentialsFromArgs({ credentials: 'credentials.json' });
			})
			.to.throw(`${highlightText('credentials.json')} must be valid JSON.`);
	});

	it('throws an error if not given a path', () => {
		chai
			.expect(() => {
				getCredentialsFromArgs({});
			})
			.to.throw('Missing username and password, or credentials file path.');
	});

	it('returns configuration if valid', () => {
		mock({
			'credentials.json': `{
				"bitbucket": {
					"username": "<YOUR USERNAME>",
					"password": "<YOUR PASSWORD>"
				}
			}`,
		});
		const got = getCredentialsFromArgs({ credentials: 'credentials.json' });
		chai.expect(got).to.deep.equal({
			bitbucket: {
				username: '<YOUR USERNAME>',
				password: '<YOUR PASSWORD>',
			},
		});
	});
});
