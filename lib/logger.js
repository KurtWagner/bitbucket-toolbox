'use strict';

const chalk = require('chalk');

module.exports = {
	error,
	debug,
	success,
	warning,
	log,
	step,
	title,
};

function error(...msgs) {
	log(chalk.red('error'), ' ', ...msgs);
}

function debug(...msgs) {
	log(chalk.magnenta('debug'), ' ', ...msgs);
}

function warning(...msgs) {
	log(chalk.yellow('warning'), ' ', ...msgs);
}

function success(...msgs) {
	log(chalk.green('success'), ' ', ...msgs);
}

function step(pos, total, ...msgs) {
	log(chalk.gray(`[${pos}/${total}]`), ' ', ...msgs);
}

function title(...msgs) {
	log(chalk.whiteBright.bold(...msgs));
}

function log(...msgs) {
	console.log(...msgs);
}