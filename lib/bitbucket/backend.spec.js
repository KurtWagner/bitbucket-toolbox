'use strict';

const nock = require('nock');
const chai = require('chai');
const {BitbucketBackend} = require('./backend');

const HTTP_TOO_MANY_REQUESTS = 429;
const HTTP_OK = 200;

describe('BitbucketBackend', () => {
	it('retries after "429 too many requests"', (done) => {
	
		const backend = new BitbucketBackend({
			username: 'bob',
			password: 'bobs-super-secret',
		});
		backend._tryAgainInMilliseconds = 5;
		
		nock('http://test.com').get('/')
		                       .reply(HTTP_TOO_MANY_REQUESTS, 'first time');
		nock('http://test.com').get('/')
		                       .reply(HTTP_OK, 'second time');
		
		backend.request('get', 'http://test.com/', {})
		       .then(onSuccess).catch(onError);
		
		function onSuccess({statusCode, body}) {
			chai.expect(statusCode).to.equal(HTTP_OK);
			chai.expect(body).to.equal('second time');
			done();
		}
		
		function onError(error) {
			done(`Should not have an error: ${error}`);
		}
	});
});
