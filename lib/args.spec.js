'use strict';

const {ACTION_COMMENTS} = require('./actions');

const chai = require('chai');
const args = require('./args');

describe('failOnSeverity argument', () => {
	it('is optional', () => {
		const argv = [
			'node',
			'bitbucket-toolbox',
			ACTION_COMMENTS,
		];
		const got = args.getArgs(argv).args.failOnSeverity;
		let expected = [];
		chai.expect(got).deep.equal(expected);
	});
	it('is retrieved from --fail-on-severity and coerces to lowercase', () => {
		const argv = [
			'node',
			'bitbucket-toolbox',
			ACTION_COMMENTS,
			'--fail-on-severity',
			'error',
			'--fail-on-severity',
			'WARNING',
		];
		const got = args.getArgs(argv).args.failOnSeverity;
		const expected = ['error', 'warning'];
		chai.expect(got).deep.equal(expected);
	});
});

describe('messageIdentifier argument', () => {
	it('is optional', () => {
		const argv = [
			'node',
			'bitbucket-toolbox',
			ACTION_COMMENTS,
		];
		const got = args.getArgs(argv).args.messageIdentifier;
		let expected;
		chai.expect(got).to.equal(expected);
	});
	it('is retrieved from --message-identifier', () => {
		const argv = [
			'node',
			'bitbucket-toolbox',
			ACTION_COMMENTS,
			'--message-identifier',
			'abc',
		];
		const got = args.getArgs(argv).args.messageIdentifier;
		const expected = 'abc';
		chai.expect(got).to.equal(expected);
	});
});

describe('username and password arguments', () => {
	it('are optional', () => {
		const argv = [
			'node',
			'bitbucket-toolbox',
			ACTION_COMMENTS,
		];
		chai.expect(args.getArgs(argv).args.username).to.equal(undefined);
		chai.expect(args.getArgs(argv).args.password).to.equal(undefined);
	});
	it('are retrieved from --username and --password', () => {
		const argv = [
			'node',
			'bitbucket-toolbox',
			ACTION_COMMENTS,
			'--username',
			'my-username',
			'--password',
			'my-password',
		];
		chai.expect(args.getArgs(argv).args.username).to.equal('my-username');
		chai.expect(args.getArgs(argv).args.password).to.equal('my-password');
	});
});

describe('android-lint argument', () => {
	it('is optional', () => {
		const argv = [
			'node',
			'bitbucket-toolbox',
			ACTION_COMMENTS,
		];
		chai.expect(args.getArgs(argv).args.androidLintFilePaths).to.deep.equal([]);
	});
	it('retrieves from --android-lint into androidLintFilePaths', () => {
		const argv = [
			'node',
			'bitbucket-toolbox',
			ACTION_COMMENTS,
			'--android-lint',
			'path/result.xml',
		];
		chai.expect(args.getArgs(argv).args.androidLintFilePaths).to.deep.equal(['path/result.xml']);
	});
	it('retrieves many from --android-lint into androidLintFilePaths', () => {
		const argv = [
			'node',
			'bitbucket-toolbox',
			ACTION_COMMENTS,
			'--android-lint',
			'path/result-1.xml',
			'--android-lint',
			'path/result-2.xml',
		];
		chai.expect(args.getArgs(argv).args.androidLintFilePaths).to.deep.equal([
			'path/result-1.xml',
			'path/result-2.xml',
		]);
	});
});

describe('--checkstyle/-c argument', () => {
	it('is optional', () => {
		const argv = [
			'node',
			'bitbucket-toolbox',
			ACTION_COMMENTS,
		];
		chai.expect(args.getArgs(argv).args.checkstyleFilePaths).to.deep.equal([]);
	});
	it('retrieves from --checkstyle into checkstyleFilePaths', () => {
		const argv = [
			'node',
			'bitbucket-toolbox',
			ACTION_COMMENTS,
			'--checkstyle',
			'path/result.xml',
		];
		chai.expect(args.getArgs(argv).args.checkstyleFilePaths).to.deep.equal(['path/result.xml']);
	});
	it('retrieves many from --checkstyle into checkstyleFilePaths', () => {
		const argv = [
			'node',
			'bitbucket-toolbox',
			ACTION_COMMENTS,
			'--checkstyle',
			'path/result-1.xml',
			'--checkstyle',
			'path/result-2.xml',
		];
		chai.expect(args.getArgs(argv).args.checkstyleFilePaths).to.deep.equal([
			'path/result-1.xml',
			'path/result-2.xml',
		]);
	});
	it('retrieves from -c into checkstyleFilePaths', () => {
		const argv = [
			'node',
			'bitbucket-toolbox',
			ACTION_COMMENTS,
			'-c',
			'path/result.xml',
		];
		chai.expect(args.getArgs(argv).args.checkstyleFilePaths).to.deep.equal(['path/result.xml']);
	});
	it('retrieves many from -c into checkstyleFilePaths', () => {
		const argv = [
			'node',
			'bitbucket-toolbox',
			ACTION_COMMENTS,
			'-c',
			'path/result-1.xml',
			'-c',
			'path/result-2.xml',
		];
		chai.expect(args.getArgs(argv).args.checkstyleFilePaths).to.deep.equal([
			'path/result-1.xml',
			'path/result-2.xml',
		]);
	});
});
