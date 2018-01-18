

### 0.0.5

**Improvement**
- Support parallel requests in backend package, this should result in faster turnarounds when the requests are known up front. Requests that page through are yet to be optimised to look ahead.

**Fix**
- Non-relative configuration and credentials paths were not being resolved correctly.
- `.bitbucket-toolbox.js` configuration was not being picked up.

**Feature**
- New `scripts` action where you can perform and respond to certain events. For now this only supports the "openPullRequests" type. This will load all open pull requests (including changed chunks).

### 0.0.4

**Fix**
- Fix - `chalk` should be a production dependency.

### 0.0.3

**Enhancement**
- Resolves #1 - Introduces `--fail-on-severity` option to the `comments` action.

### 0.0.2

**Fixes**

- Fixes #4 - Can't read attribute "username" on `null` when comparing existing `deleted` comment.

### 0.0.1

First release as migration of [Checkee](https://github.com/kurtwagner/checkee)
tool for commenting on pull requests from linter results.
