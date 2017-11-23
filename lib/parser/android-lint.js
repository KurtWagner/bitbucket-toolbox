'use strict';

module.exports = {
	parseAndroidLint,
};

function parseAndroidLint(...androidLintResults) {
	const androidLintFiles = androidLintResults.map(({ issues }) => issues.issue).reduce((accum, issue) => {
		return accum.concat(...issue);
	}, []);

	const filePathErrors = {};

	androidLintFiles.forEach(({ $: issue, location: rawLocation }) => {
		const { $: location } = rawLocation[0];

		const { line, column, file: fileName } = location;
		const { severity, priority, id, category, explanation, message, summary } = issue;

		const messageParts = [`**${severity.toUpperCase()}**: ${summary}`];
		if (message) {
			messageParts.push(`\n\n${message}`);
		}

		// Join the error lines (if any) into a code formatted section
		// of the message
		const errorLines = [];
		let errorLineNo = 1;
		while (issue[`errorLine${errorLineNo}`]) {
			errorLines.push(issue[`errorLine${errorLineNo}`]);
			++errorLineNo;
		}
		if (errorLines.length > 0) {
			messageParts.push(`\n\n\`\`\`\n${errorLines.join('\n')}\n\`\`\``);
		}

		if (explanation) {
			messageParts.push(`\n\n**Why?** ${explanation}`);
		}

		messageParts.push(`\n\n[Category: ${category}, ID: ${id}, Priority: ${priority}/10]`);

		if (!filePathErrors[fileName]) {
			filePathErrors[fileName] = [];
		}
		filePathErrors[fileName].push({
			line: parseInt(line, 10),
			column: parseInt(column, 10),
			message: messageParts.join(''),
		});
	});

	return Object.keys(filePathErrors).reduce((result, fileName) => {
		return result.concat([
			{
				fileName,
				errors: filePathErrors[fileName],
			},
		]);
	}, []);
}
