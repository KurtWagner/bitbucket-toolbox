'use strict';

const request = require('request');
const Q = require('q');

const HTTP_TOO_MANY_REQUESTS = 429;
const HTTP_FORBIDDEN = 403;
const HTTP_UNAUTHORIZED = 401;

const DEFAULT_TRY_AGAIN_MS = 1000;

class BitbucketBackend {
	// set maxParallelRequests to 1 to one do one at a time
	constructor({ username, password, maxParallelRequests = 10 }) {
		this._username = username;
		this._password = password;
		this._maxParallelRequests = maxParallelRequests;

		/**
		 * Due to rate limits we're going to queue requests and control how
		 * they're fired out. This is slower but reduces our chances of hitting
		 * the pesky limits
		 */
		this._requestQueue = [];
		this._inProcessing = 0;
		this._tryAgainInMilliseconds = DEFAULT_TRY_AGAIN_MS;
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
		if (backend._inProcessing < backend._maxParallelRequests) backend._nextIntQueue();

		return deferred.promise;

		////////////////////////////////////////////////////

		function handleResponse(error, response, body) {
			try {
				switch (response.statusCode) {
					case HTTP_TOO_MANY_REQUESTS: {
						retryRequest();
						break;
					}
					case HTTP_FORBIDDEN: {
						console.error(body);
						throw new Error('Forbidden request made.');
					}
					case HTTP_UNAUTHORIZED: {
						const message = [
							'1. You have configured your username and password',
							'2. Your username is in fact your username and not email',
							'3. Your username and password are correct',
						];
						throw new Error(`We could not authorize you. Please ensure:\n\n${message.join('\n')}`);
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
			} catch (e) {
				throw e;
			} finally {
				--backend._inProcessing;
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
			++this._inProcessing;
			const queueMethod = this._requestQueue.shift();
			queueMethod();
		} else {
			this._tryAgainInMilliseconds = DEFAULT_TRY_AGAIN_MS; // reset when none left
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
