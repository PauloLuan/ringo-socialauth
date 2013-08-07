ringo-socialauth
================

Authenticating users through external oAuth providers like Gmail, Hotmail, Yahoo, Twitter, Facebook, LinkedIn, Foursquare, MySpace, Salesforce, Yammer. Using the project (https://code.google.com/p/socialauth/)


To run this application:

	ringo main.js

Then, open in your browser:

	http://localhost:8080

by security socialauth applications don't run in localhost, because the callback URL is not valid to provider (facebook, twitter, etc), change your "/etc/hosts" to route a fake site to your localhost, for example:

	127.0.0.1 localhost example.com

the site "example.com" now points to your localhost, run your application and open in your browser:

	http://example.com:8080

This app use java framework socialauth: https://code.google.com/p/socialauth/
