'use strict';

module.exports = {
	parseCheckstyle,
};

function parseCheckstyle(...checkstyles) {
	const checkstyleFiles = [];
	checkstyles.forEach(({checkstyle}) => {
		if (checkstyle.file) {
			checkstyleFiles.push(...checkstyle.file);
		}
	});
	
	return checkstyleFiles.map((rawFile) => {
		const fileName = rawFile['$'].name;
		const errors = (rawFile.error || []).map((rawError) => {
			const {
				line,
				column,
				severity,
				message,
				source,
			} = rawError['$'];
			
			const messageParts = [`**${severity.toUpperCase()}**: ${message}`];
			if (source) {
				messageParts.push(`\n\n[source: ${getSourceComment(source)}]`);
			}
			
			return {
				line: parseInt(line, 10),
				column: parseInt(column, 10),
				message: messageParts.join(''), 
				severity: String(severity||'').toLowerCase(),
			};
		});
		return {
			fileName,
			errors,
		};
	});
	
	function getSourceComment(source) {
		const matches = source.match(/^eslint\.(\w+)\.(.+)$/i);
		if (matches !== null) {
			const [, type, rule] = matches;
			return `[${source}](http://eslint.org/docs/${type}/${rule})`;
		} 
		return source;
	}
}
