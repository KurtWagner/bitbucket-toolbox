'use strict';

const request = require('request');
const Q = require('q');

const HTTP_TOO_MANY_REQUESTS = 429;
const HTTP_FORBIDDEN = 403;
const HTTP_UNAUTHORIZED = 401;

class BitbucketBackend {
	constructor({ username, password }) {
		this._username = username;
		this._password = password;

		/**
		 * Due to rate limits we're going to queue requests and control how
		 * they're fired out. This is slower but reduces our chances of hitting
		 * the pesky limits
		 */
		this._requestQueue = [];
		this._queueRunning = false;
		this._tryAgainInMilliseconds = 2000;
	}

	request(method, url, formData) {
		const backend = this;
		const deferred = Q.defer();
		
		const executeRequest = () => {
			const requestConfig = backend._requestConfig({ url, formData });
			request[method](requestConfig, handleResponse);
		};

		backend._requestQueue.push(executeRequest);

		// if the queue isn't running, kick it off
		if (!backend._queueRunning) backend._nextIntQueue();
		
		return deferred.promise;
		
		////////////////////////////////////////////////////
		
		function handleResponse(error, response, body) {
			switch (response.statusCode) {
				case HTTP_TOO_MANY_REQUESTS: {
					retryRequest();
					break;
				}
				case HTTP_FORBIDDEN: {
					console.error(body);
					process.exit(1); // TODO: use a better exit code
					break;
				}
				case HTTP_UNAUTHORIZED: {
					const message = [
						'1. You have configured your username and password',
						'2. Your username is in fact your username and not email',
						'3. Your username and password are correct',
					];
					console.error(`We could not authorize you. Please ensure:\n\n${message.join('\n')}`);
					process.exit(1); // TODO: use a better exit code
					break;
				}
				default: {
					if (error) {
						deferred.reject(error);
					} else {
						deferred.resolve({ statusCode: response.statusCode, body });
					}
					backend._nextIntQueue();
				}
			}
		}
		
		function retryRequest() {
			setTimeout(() => {
				backend._requestQueue.unshift(executeRequest);
				backend._tryAgainInMilliseconds *= 2;
				backend._nextIntQueue();
			}, backend._tryAgainInMilliseconds);
		}
	}

	_nextIntQueue() {
		if (this._requestQueue.length > 0) {
			this._queueRunning = true;
			const queueMethod = this._requestQueue.shift();
			queueMethod();
		} else {
			this._queueRunning = false;
		}
	}

	_requestConfig({ url, formData = {} }) {
		return {
			formData,
			url,
			auth: {
				user: this._username,
				pass: this._password,
				sendImmediately: true,
			},
		};
	}
}

module.exports = {
	BitbucketBackend,
};
