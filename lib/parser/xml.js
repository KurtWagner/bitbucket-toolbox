'use strict';

const xml2js = require('xml2js');
const q = require('q');

module.exports = {
	parseXml,
};

function parseXml(xml) {
	const defer = q.defer();
	xml2js.parseString(xml, (err, result) => {
		if (err) {
			defer.reject(err);
		} else {
			defer.resolve(result); // result.checkstyle
		}
	});
	return defer.promise;
}