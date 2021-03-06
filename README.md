# AngularJS plus Twitter login


Wrapping several auth call into one angular module. Can be use with desktop or phonegap.


## Demo

See gh-pages branch

## Dependencies
- required:

	angular.js (1.3.X +)

	jsOAuth.js (1.4.X +)


- optional

	see bower.json

See `bower.json` and `index.html` in the `gh-pages` branch for a full list / more details

## Install
1. download the files
	1. Bower
		1. add `"angular-twitter": "git@github.com:joelchu/angular-twitter.git"` to your `bower.json` file then run `bower install` OR run `bower install angular-twitter` (not register with bower at the moment)
		2. Make sure you have "silverorange-jsOAuth": "~1.4.0" and of course, angular 1.3.0+

2. include the files in your app
	1. `angular-twitter.min.js`

3. include the module in angular (i.e. in `app.js`) - `nbTwitter`

4. This module require you MUST provide a config to work (go to your twitter app page and set it up)
	1. 3 required fields `consumerKey` , `consumerSecret`  and `callbackUrl`
	2. Then inject the service into your controller via `$nbTwitter`


See the `gh-pages` branch, files `bower.json` and `index.html` for a full example.


## Documentation
See the `twitter.js` file top comments for usage examples and documentation
https://github.com/joelchu/angular-twitter/blob/master/twitter.js


## Development

1. `git checkout gh-pages`
	1. run `npm install && bower install`
	2. write your code then run `grunt`
	3. git commit your changes
2. copy over core files (.js and .css/.less for directives) to master branch
	1. `git checkout master`
	2. `git checkout gh-pages twitter.js twitter.min.js twitter.less twitter.css twitter.min.css`
3. update README, CHANGELOG, bower.json, and do any other final polishing to prepare for publishing
	1. git commit changes
	2. git tag with the version number, i.e. `git tag v1.0.0`
4. create github repo and push
	1. [if remote does not already exist or is incorrect] `git remote add origin [github url]`
	2. `git push origin master --tags` (want to push master branch first so it is the default on github)
	3. `git checkout gh-pages`
	4. `git push origin gh-pages`
5. (optional) register bower component
	1. `bower register angular-twitter [git repo url]`
