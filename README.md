[![Build Status](https://travis-ci.org/KurtWagner/bitbucket-toolbox.svg?branch=master)](https://travis-ci.org/KurtWagner/bitbucket-toolbox) [![Coverage Status](https://coveralls.io/repos/github/KurtWagner/bitbucket-toolbox/badge.svg?branch=master)](https://coveralls.io/github/KurtWagner/bitbucket-toolbox?branch=master) [![Dependency Status](https://david-dm.org/kurtwagner/bitbucket-toolbox.svg)](https://david-dm.org/kurtwagner/bitbucket-toolbox) [![devDependencies Status](https://david-dm.org/kurtwagner/bitbucket-toolbox/dev-status.svg)](https://david-dm.org/kurtwagner/bitbucket-toolbox?type=dev)

# Bitbucket Toolbox

> **Important** - This is experimental release that was migrated from a previous tool [checkee](https://github.com/kurtwagner/checkee). It's currently only being utilised personally.

Small collection of tools for automating tasks with Bitbucket's API.

## Comments

Creates comments on a Bitbucket pull request for given checkstyle result XML files. This process will only comment on additional lines and will remove any comments made by itself in previous runs.

It's optimized for consumption within an existing project but can be used independently. The only configuration file required is a credentials file. See authentication below for more information.

Comments will only be left for lines located in the returned diff. This may not only include added and changed lines but lines around such ones. Keep this in mind when using the `--fail-on-severity` option. It may not only reflect lines touched by the author but lines around the touches.

### Linter comments on Pull Request 

```
> bitbucket-toolbox comments \
        --repo-user your-team \
	--repo-slug your-project \
	--pull-request 10       \
	--checkstyle path/to/result.xml;
```

Parses and leaves comments on a pull request for given lint results.

#### Supported formats

* [Android Lint Result XML](http://tools.android.com/tips/lint) with `--android-lint`
* [Checkstyle Result XML](https://checkstyle.sourceforge.io) with `--checkstyle`
 * _Needs examples of tools that have checkstyle formatters. e.g, eslint_ 

#### Options

##### --pull-request

The id of the pull request.

##### --repo-slug

The name of the repository that the pull request belongs to.

##### --repo-user

The user who owns the repository that the pull request belongs to.

##### --checkstyle

One or more paths to checkstyle result XML files. This cannot be used in conjunction with `--android-lint`.

##### --android-lint

One or more paths to Android Lint result XML files. This cannot be used in conjunction with `--checkstyle`.

##### --fail-on-severity

Exit on a non-zero code to indicate that a given severity was seen in a comment. For example, fail if a comment is made for an "error". This is useful if you wish to fail a build process only if a certain severity was introduced.

Severities are case insensitive.

## Scripts

These are functions you configure that resolve from built in queries. For example, list all outstanding open pull requests, where you define what "outstanding" means.

```javascript
// file: .bitbucket-toolbox.js
module.exports = {
  scripts: {
    outstanding: {
      type: 'openPullRequests',
      resolve: ({pullRequests}) => {
        pullRequests.filter(isOutstanding)
                    .forEach(printPullRequest);
      }
    }),
  },
};
```
This can be run with

```
bitbucket-toolbox run outstanding
```

The `resolve` function also accepts a `Promise` as a return value, if you wish to perform asynchronous action.

### Script Types

- `openPullRequests` - This is the only script type this supports. It passes `pullRequests` in an associative array to the `resolve` handler. Pull requests is a raw array of [pull requests from the bitbucket API](https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Busername%7D/%7Brepo_slug%7D/pullrequests/%7Bpull_request_id%7D) with included changed chunks for the [diff](https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Busername%7D/%7Brepo_slug%7D/pullrequests/%7Bpull_request_id%7D/diff).

## Reviewers

_In progress_

## Tasks

_In progress_

# Configuration

The simplest way to setup your project is using a `.bitbucket-toolbox.js` file. Here you can define the repository details to avoid repeating them when using the command interface.

```
module.exports = {
	config: {
		bitbucket: {
			repoSlug: '<REPO SLUG>',
			repoUser: '<REPO USER>',
		},
	},
};
```

or in `.bitbucket-toolbox.json`

```
{
	"bitbucket": {
		"repoSlug": "<REPO SLUG>",
		"repoUser": "<REPO USER>"
	}
}
```

Alternatively you include the `--repo-slug` and `--repo-user` at the command line.


# Authentication

We only support usernames and passwords. This should be the user you want to be making the comments and changes on the pull requests. It should have read and write access to the pull request and repository plus read on account. If the user has two-factor authentication enabled, you will need to use an [app password](https://confluence.atlassian.com/bitbucket/app-passwords-828781300.html)<sup>[1](https://blog.bitbucket.org/2016/06/06/app-passwords-bitbucket-cloud/)</sup>.

> **Note:** To control accessibility and limit scope while not exposing the accounts password you should consider using an app password regardless of 2-factor authentication.

## Username/Password

In a JSON file somewhere you safely control you can include your credentials.

```
{
	"bitbucket": {
		"username": "<YOUR USERNAME>",
		"password": "<YOUR PASSWORD>"
	}
}
```

At time of execution you consume the credentials file using the `--credentials` option.

Alternatively, you can pass the `--username` and `--password` but be aware that this may appear in your logs. Normally you will start your script with

```
set +x
```

so that commands you run are not echoed to the log.

> **Note:** The `username` is not your email, it's your actual username. Failing to use your username will fail to connect.

# Message identifier

The message identifier is used to uniquely identify comments made by the user. Upon update, it will remove any previous comments before making new ones. You should manually set this if you plan to run multiple linter result files separately on a single pull request. e.g,

```
bitbucket-toolbox comments
           --checkstyle perlcritic-checkstyle.xml \
           --message-identifier ".:perl:." \
           --credentials "/credentials.json" \
           --pull-request 1000;

bitbucket-toolbox comments
           --checkstyle eslint-checkstyle.xml \
           --message-identifier ".:js:." \
           --credentials "/credentials.json" \
           --pull-request 1000;
```	

The message identifier defaults to `.:.`.

# Global Options

##### --repo-slug / config.repoSlug

The name of the bitbucket repository.

##### --repo-user / config.repoUser

The username who owns the bitbucket repository containing the pull request.

##### --credentials

Path to the JSON file containing a `bitbucket.username` and `bitbucket.password`.

# Examples

## Checkstyle result comments

The following will make comments on pull request 1324 using errors from `checkstyle-result-1.xml` and `checkstyle-result-2.xml`.

```
bitbucket-toolbox comments \
	--checkstyle checkstyle-result-1.xml \
	--checkstyle checkstyle-result-2.xml \
	--repo-slug my-app \
	--repo-user my-user \
	--pull-request 1324 \
	--credentials "/restricted/bitbucket-credentials.json"
```

## Android Lint result comments

The following will make comments on pull request 1324 using errors from `android-lint-result-1.xml` and `android-lint-2.xml`.

```
bitbucket-toolbox comments \
	--android-lint android-lint-result-1.xml \
	--android-lint android-lint-result-2.xml \
	--repo-slug my-app \
	--repo-user my-user \
	--pull-request 1324 \
	--credentials "/restricted/bitbucket-credentials.json"
```
![Android Lint Comment Sample](/screenshots/android-sample-comment.png)
