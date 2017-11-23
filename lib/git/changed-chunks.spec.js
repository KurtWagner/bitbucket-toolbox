'use strict';

const chai = require('chai');
const {ChangedChunks} = require('./changed-chunks');

describe('GIVEN ChangedChunks on package.json', () => {
	
	const diff = `
diff --git a/package.json b/package.json
index a01fff5..c6020e4 100644
--- a/package.json
+++ b/package.json
@@ -10,14 +10,14 @@
	 "postinstall": "do something",
	 "preinstall": "do something else"
   },
+  "license": "MIT",
   "private": true,
-  "version": "6.0.0",
   "dependencies": {
	 "dependency-100": "1.0.0",
	 "dependency-101": "1.0.0"
   },
   "devDependencies": {
-    "dependency-1": "1.0.0",
+    "dependency-1": "1.0.1",
	 "dependency-2": "1.0.0",
	 "dependency-3": "1.0.0",
	 "dependency-4": "1.0.0",
	`;
	const changedChunks = new ChangedChunks({diff});
	
	describe('WHEN calling getLine with filename not changed', () => {
		it('THEN returns null', () => {
			const got = changedChunks.getLine('not-package.json', 100);
			const expected = null;
			chai.expect(got).to.equal(expected);
		});
	});
	
	describe('WHEN calling getLine with added line', () => {
		it('THEN returns line type ADDED', () => {
			// +  "license": "MIT",
			const got = changedChunks.getLine('package.json', 13).changed;
			const expected = true;
			chai.expect(got).to.equal(expected);
		});
	});
	
	describe('WHEN calling getLine with changed line', () => {
		it('THEN returns line type CHANGED', () => {
			// -    "dependency-1": "1.0.0",
			// +    "dependency-1": "1.0.1",
			const got = changedChunks.getLine('package.json', 20).changed;
			const expected = true;
			chai.expect(got).to.equal(expected);
		});
	});
	
	describe('WHEN calling getLine with unchanged line', () => {
		it('THEN returns line type UNCHANGED', () => {
			// "postinstall": "do something",
			const got = changedChunks.getLine('package.json', 10).changed;
			const expected = false;
			chai.expect(got).to.equal(expected);
		});
	});
	
	describe('WHEN calling getLine with changed file relative to file system', () => {
		it('THEN returns guesses filename', () => {
			// "postinstall": "do something", (line 10)
			const got = changedChunks.getLine('/Home/user/repo/package.json', 10).fileName;
			const expected = 'package.json';
			chai.expect(got).to.equal(expected);
		});
	});
});
