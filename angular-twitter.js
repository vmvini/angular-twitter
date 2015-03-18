/* global OAuth */

/**
@fileOverview

    This is inspired by http://www.oodlestechnologies.com/blogs/Twitter-integration-on-PhoneGap-using-ChildBrowser-and-OAuth-for-iOS-and-Android-Platforms
    And package it to use with AngularJS

    Switchable between Desktop or Phonegap via the `env` options

@toc

*/

(function(window, angular, undefined) { 'use strict';

    var TwitterCls = function($q , $http , options , storageMethods , debug)
    {
        var oauth; // It Holds the oAuth data request
        var requestParams; // Specific param related to request
        var self = this;

        /**
         * wrapper methods to cut down those if/else debug code
         */
        var errorHandler = function(defer , err , msg)
        {
            if (debug) {
                if (!msg) {
                    msg = 'ERROR:';
                }
                console.log(msg , err);
            }
            defer.reject(err);
        };

        var callbackErrorHandler = function(defer , msg)
        {
            return function(error)
            {
                errorHandler(defer , error , msg);
            };
        };

        var successHandler = function(defer , data , msg)
        {
            if (debug) {
                if (!msg) {
                    msg = 'SUCCESS:';
                }
                console.log(msg , data);
            }
            defer.resolve(data);
        };

        /**
         * check if the user has logged in or not
         */
        this.init = function()
        {
            var defer = $q.defer();
            // start checking
            storageMethods.get().then(function(storedAccessData)
            {
                if (storedAccessData) { // we do a very simple test here, expecting you know what you are doing
                    options.accessTokenSecret = storedAccessData.accessTokenSecret; // data will be saved when user first first signin
                    // request the jsOAuth lib
                    oauth = OAuth(options);
                    oauth.get('https://api.twitter.com/1/account/verify_credentials.json?skip_status=true', function(data)
                    {
                        var entry = JSON.parse(data.text);
                        successHandler(defer , entry , 'USER DATA RETURN FROM VERIFY CREDENTIALS');
                    }, callbackErrorHandler(defer , 'ERROR WHEN VERIFY CREDENTIALS'));
                }
                else {
                    oauth = OAuth(options);
                    oauth.get('https://api.twitter.com/oauth/request_token', function(data)
                    {
                        requestParams = data.text;
                        successHandler(defer , requestParams);
                        /* skip the open browser here for the moment
                        cb.showWebPage('https://api.twitter.com/oauth/authorize?'+data.text); // This opens the Twitter authorization / sign in page
                        cb.onLocationChange = function(loc){
                            Twitter.success(loc);
                        }; // Here will will track the change in URL of ChildBrowser
                        */
                    }, callbackErrorHandler(defer , 'CALL TWITTER OPEN ERROR'));
                }
            });
            return defer.promise;
        };

        /**
         * after user login on success method
         * @param {string} loc - what twitter passing back
         */
        this.loginSuccess = function(loc)
        {
            if (debug) {
                console.log('TWITTER RETURN RAW DATA' , loc);
            }
            // Parse the returned URL
            var index, verifier = '';
            var params = loc.substr(loc.indexOf('?') + 1);
                params = params.split('&');
            for (var i = 0; i < params.length; i++) {
                var y = params[i].split('=');
                if(y[0] === 'oauth_verifier') {
                    verifier = y[1];
                }
            }
            // Here we are going to change token for request with token for access
            /*
                Once user has authorised us then we have to change the token for request with token of access
                here we will give data to localStorage.
            */
            oauth.get('https://api.twitter.com/oauth/access_token?oauth_verifier='+verifier+'&'+requestParams, function(data)
            {
                var accessParams = {},
                    qvars_tmp = data.text.split('&');

                for (var i = 0; i < qvars_tmp.length; i++) {
                    var y = qvars_tmp[i].split('=');
                    accessParams[y[0]] = decodeURIComponent(y[1]);
                }
                // setter in the jsOAuth
                oauth.setAccessToken([accessParams.oauth_token, accessParams.oauth_token_secret]);
                // Saving token of access in Local_Storage
                var accessData = {
                        'accessTokenKey': accessParams.oauth_token,
                        'accessTokenSecret': accessParams.oauth_token_secret
                    };
                // store the items
                storageMethods.set(accessData).then(function()
                {
                    oauth.get('https://api.twitter.com/1/account/verify_credentials.json?skip_status=true', function(data)
                    {
                        var entry = JSON.parse(data.text);
                        if (debug) {
                            console.log("TWITTER USER: " , entry);
                        }
                        successHandler(defer , entry);

                    },callbackErrorHandler(defer, '2nd CALL VERIFY CREDENTIALS ERROR'));
                });
            }, callbackErrorHandler(defer));
        };

        /**
         * send a tweet
         * @param {string} tweetMsg - the tweet to send
         */
        this.tweet = function(tweetMsg)
        {
            var defer = $q.defer();
            storageMethods.get().then(function(storedAccessData)
            {
                options.accessTokenKey = storedAccessData.accessTokenKey; // it will be saved on first signin
                options.accessTokenSecret = storedAccessData.accessTokenSecret; // it will be save on first login
                oauth = OAuth(options);
                oauth.get('https://api.twitter.com/1/account/verify_credentials.json?skip_status=true',function(data)
                {
                    var entry = JSON.parse(data.text);
                    self.post(defer , tweetMsg);
                },callbackErrorHandler(defer));
            });
            return defer.promise;
        };

        /**
         * callback after the verify credentials
         */
        this.post = function(defer , tweetMsg)
        {
            var json = {
                    'status': tweetMsg,
                    'trim_user': 'true'
                };
             oauth.post('https://api.twitter.com/1/statuses/update.json', json , function(data)
             {
                var entry = JSON.parse(data.text);
                successHandler(defer , entry);
            },callbackErrorHandler(defer , 'SEND TWEET ERROR'));
        };


    }; // End Of - TwitterCls


    /**
     * create the angular module and service
     */
    angular.module('nbTwitter', []).provider('$twitter', ['$q' , '$http' , function($q , $http)
    {
        var options = {
                'consumerKey': 'xxxxxxxxxxxxxxx', // YOUR Twitter CONSUMER_KEY
                'consumerSecret': 'xxxxxxxxxxxxx', // YOUR Twitter CONSUMER_SECRET
                'callbackUrl': "http://Your-callback-URL/"
            },
            debug = false;
        /**
         * we also need to provide an object with set / get method to store the temporary key from Twitter
         * this method expects return in $q.promise, you could use our other module call angular-sqlite :)
         * by default we create a simple localStorage that takes care of the storing and retrieing
         */
        var storageMethods = {
                get: function()
                {
                    var defer = $q.defer(),
                        data = window.localStorage.getItem('angular-twitter-store');
                    // just return it
                    defer.resolve(JSON.parse(data));
                    return defer.promise;
                },
                set: function(data)
                {
                    data = JSON.stringify(data); // we do the convertion here
                    var defer = $q.defer();
                    // just resolve it to make it consistence
                    defer.resolve(window.localStorage.setItem('angular-twitter-store' , data));
                    return defer.promise;
                }
            };

        // you MUST config this one before you can use, the following are just placeholder
        this.config = function(opt  , debugMode , newStorageMethods)
        {
            // first check if you have provide anything
            if (angular.isUndefined(opt) || angular.equals(opt, {}) || angular.equals(opt , null)) {
                throw 'You must provide a config options [env,consumerKey,consumerSecret,callbackUrl]';
            }
            // then double check all the keys
            angular.forEach(options , function(val, key)
            {
                if (angular.isUndefined(opt[key]) || !angular.isString(opt[key])) {
                    throw 'You must provide the `' + key + '` and it must be a string!';
                }
                else {
                    if (options[key] && opt[key]===options[key]) {
                        throw 'Your `' + key + '` dont give me a dummy value, mate!';
                    }
                }
            });
            // all pass
            options = opt;
            // set debug mode
            if (debugMode && typeof debugMode === 'boolean') {
                debug = debugMode;
            }
            // pass your own implementation of the storage methods
            if (!angular.isUndefined(newStorageMethods) && angular.isObject(newStorageMethods)) {
                storageMethods = newStorageMethods;
            }
        };

        /**
         * Service generator
         * @param {object} $q
         * @param {object} $http
         * @returns {object} instance of TwitterCls
         */
        this.$get = function()
        {
            return new TwitterCls($q , $http , options , storageMethods , debug);
        };
    }]);

})(window, window.angular);
// EOF