'use strict';

const fs = require('fs');
const Q = require('q');

const {
	parseCheckstyle,
	parseAndroidLint,
	parseXml,
} = require('../lib/parser');

module.exports = {
	loadCheckstyleResults,
	loadAndroidLintResults
};

function loadCheckstyleResults(resultFilePaths) {
	return getLinterResults(resultFilePaths)
		.then(linterResults => parseCheckstyle(...linterResults));
}

function loadAndroidLintResults(resultFilePaths) {
	return getLinterResults(resultFilePaths)
		.then(linterResults => parseAndroidLint(...linterResults));
}

function getLinterResults(filePaths) {
	const xmlPromises = [];
	filePaths.forEach((filePath) => {
		if (!fs.existsSync(filePath)) {
			throw new Error(`Couldn't find file ${filePath}.`);
		}
		const contents = fs.readFileSync(filePath);
		xmlPromises.push(parseXml(contents));
	});
	return Q.all(xmlPromises);
}
