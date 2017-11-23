'use strict';

module.exports = Object.assign({},
	require('./backend'),
	require('./client'),
	require('./pull-request'),
	require('./repository')
);
