'use strict';

module.exports = {
	parseXml,
};

function parseXml(xml) {
	const defer = require('q').defer();
	require('xml2js').parseString(xml, (err, result) => {
		if (err) {
			defer.reject(err);
		} else {
			defer.resolve(result); // result.checkstyle
		}
	});
	return defer.promise;
}