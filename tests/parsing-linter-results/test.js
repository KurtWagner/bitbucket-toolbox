'use strict';

const chai = require('chai');
const path = require('path');
const fs = require('fs');
const glob = require('glob');

const { loadAndroidLintResults, loadCheckstyleResults } = require('../../lib/loaders');

const GIVEN_EXT = '.given.xml';

getTests().forEach(runTest);

//////////////////

function runTest(givenTestPath) {
	const expectedFilePath = givenTestPath.replace(/given.xml$/, 'expected.json');
	const expected = JSON.parse(fs.readFileSync(expectedFilePath));

	// e.g "android-lint-1.given.xml" => "android-lint-1"
	const baseName = path.basename(givenTestPath, GIVEN_EXT);

	it(`Test ${baseName}`, done => {
		const loader = getLoader(baseName);
		loader([givenTestPath])
			.then(got => {
				chai.expect(got).to.deep.equal(expected);
				done();
			})
			.catch(done);
	});
}

function getLoader(baseName) {
	const type = baseName.replace(/-\d+$/, '');
	return {
		'android-lint': loadAndroidLintResults,
		checkstyle: loadCheckstyleResults,
	}[type];
}

function getTests() {
	const testsPath = path.join(__dirname, './fixtures');
	return glob.sync(`${testsPath}/*${GIVEN_EXT}`);
}
