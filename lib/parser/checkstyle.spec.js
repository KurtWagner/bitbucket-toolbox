'use strict';

const chai = require('chai');
const {parseCheckstyle} = require('./checkstyle');

it('accepts eslint sources', () => {
	const got = parseCheckstyle({
		checkstyle: {
			file: [{
				'$': {
					name: 'file.js',
				},
				error: [{
					'$': {
						line: 10,
						column: 100,
						severity: 'error',
						message: 'Please do not do this',
						source: 'eslint.rules.no-console',
					},
				}, {
					'$': {
						line: '20',
						column: '11',
						severity: 'warning',
						message: 'You should avoid this',
						source: 'eslint.rules.use-strict',
					},
				}, {
					'$': {
						line: '53',
						column: '12',
						severity: 'warning',
						message: 'No source warning',
					},
				}],
			}],
		},
	});
	const expected = [{
		fileName: 'file.js',
		errors: [{
			line: 10,
			column: 100,
			severity: 'error',
			message: `**ERROR**: Please do not do this\n\n[source: [eslint.rules.no-console](http://eslint.org/docs/rules/no-console)]`, 
		}, {
			line: 20,
			column: 11,
			severity: 'warning',
			message: `**WARNING**: You should avoid this\n\n[source: [eslint.rules.use-strict](http://eslint.org/docs/rules/use-strict)]`, 
		}, {
			line: 53,
			column: 12,
			severity: 'warning',
			message: `**WARNING**: No source warning`, 
		}],
	}];
	chai.expect(got).to.deep.equal(expected);
});

it('accepts unknown sources', () => {
	const got = parseCheckstyle({
		checkstyle: {
			file: [{
				'$': {
					name: 'file.js',
				},
				error: [{
					'$': {
						line: 65,
						column: 123,
						severity: 'error',
						message: 'Please do not do this',
						source: 'unknown.test',
					},
				}],
			}],
		},
	});
	const expected = [{
		fileName: 'file.js',
		errors: [{
			line: 65,
			column: 123,
			severity: 'error',
			message: `**ERROR**: Please do not do this\n\n[source: unknown.test]`, 
		}]
	}];
	chai.expect(got).to.deep.equal(expected);
});
