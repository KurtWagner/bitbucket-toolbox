'use strict';

module.exports = Object.assign({},
	require('./android-lint'),
	require('./checkstyle'),
	require('./xml')
);