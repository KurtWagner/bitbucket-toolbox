'use strict';

const parseDiff = require('parse-diff');

class ChangedChunks {
	constructor({ diff }) {
		var files = parseDiff(diff) || {};
		this.raw = files.map(file => {
			const fileName = file.to;

			// group all chunks into one map of new line to previous and changed flag
			// we want to end up with something like { 10: { changed: true}, 15 : { etc }}
			const lines = file.chunks.map(makeLineChangedMap).reduce(reduceChunksIntoOne, {});

			return {
				fileName,
				lines,
			};
		});
	}

	getLine(fileName, line) {
		const file = this._getFile(fileName);
		if (!file) {
			return null;
		}

		const lineDetails = file.lines[line];
		if (lineDetails) {
			return {
				changed: lineDetails.changed,
				previousLine: lineDetails.previousLine,
				newLine: line,
				fileName: file.fileName,
			};
		}
		return null;
	}

	_getFile(fileName) {
		return this.raw.find(file => {
			return compareFileNames(file.fileName, fileName);
		});
	}
}

function compareFileNames(fileNameA, fileNameB) {
	const filePartsA = fileNameA.split('/').reverse();
	const filePartsB = fileNameB.split('/').reverse();

	const minLength = Math.min(filePartsA.length, filePartsB.length);
	filePartsA.splice(minLength, filePartsA.length);
	filePartsB.splice(minLength, filePartsB.length);

	return filePartsA.join('/') === filePartsB.join('/');
}

function makeLineChangedMap({ changes }) {
	return changes
		.filter(change => {
			// we don't care for deletes when considering styles, only new lines
			// or old lines that are still hanging about.
			return !change.del;
		})
		.reduce((accumulator, change) => {
			// ln2 is new line after changes
			const currentLine = change.ln || change.ln2;
			accumulator[currentLine] = {
				// ln1 represents previous line, otherwise ln is actual line
				previousLine: change.ln || change.ln1,
				// normal lines are not add or del
				changed: !change.normal,
			};
			return accumulator;
		}, {});
}

function reduceChunksIntoOne(accumulator, chunk) {
	Object.assign(accumulator, chunk);
	return accumulator;
}

module.exports = {
	ChangedChunks,
};
