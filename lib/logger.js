'use strict';

const colors = require('./colors');
const ProgressBar = require('progress');

module.exports = {
	error,
	debug,
	success,
	warning,
	log,
	step,
	title,
	logProgress,
};

function error(...msgs) {
	log(colors.redText('error'), ...msgs);
}

function debug(...msgs) {
	log(colors.magnentaText('debug'), ...msgs);
}

function warning(...msgs) {
	log(colors.yellowText('warning'), ...msgs);
}

function success(...msgs) {
	log(colors.greenText('success'), ...msgs);
}

function step(pos, total, ...msgs) {
	log(colors.grayText(`[${pos}/${total}]`), ...msgs);
}

function title(...msgs) {
	log(colors.highlightText(...msgs));
}

function log(...msgs) {
	console.log(...msgs);
}

function logProgress(message, { total }) {
	const bar = new ProgressBar(`${message} [:percent]`, { total });
	return {
		tick: () => bar.tick(),
	};
}
