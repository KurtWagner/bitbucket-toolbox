'use strict';

const emoji = require('node-emoji');

module.exports = {
	fetching: () => emoji.get('truck'),
	learning: () => emoji.get('mortar_board'),
};
