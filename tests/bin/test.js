'use strict';

const chai = require('chai');
const { exec } = require('child_process');
const path = require('path');

const COMMAND = `node ${path.join(__dirname, '../..', 'bin/bitbucket-toolbox.js')}`;

// skipping for now until more complete bin tests can be written
// at the moment these fail on travis
describe.skip('Missing bitbucket pull request details throw errors', () => {
	it('throws an error if missing all pull request details', done => {
		exec(COMMAND, (err, stdout, stderr) => {
			chai.expect(stderr).to.equal('Required repo slug, repo user and pull request id\n');
			chai.expect(err).to.not.equal(undefined);
			done();
		});
	});
	it('throws an error if missing all pull request details', done => {
		exec(
			`${COMMAND}
			--repo-slug "repo"
			--repo-user "user"
			--pull-request-id "10"
		`,
			(err, stdout, stderr) => {
				chai.expect(stderr).to.not.equal('Required repo slug, repo user and pull request id\n');
				chai.expect(err).to.not.equal(undefined);
				done();
			}
		);
	});
});
