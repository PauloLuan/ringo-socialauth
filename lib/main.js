/*
	@author: Paulo Luan (http://github.com/PauloLuan)
	
	Original Framework: https://code.google.com/p/socialauth/wiki/GettingStarted
*/

// Add all dependencies to classpath
require('fs').listTree(module.resolve('../jars')).forEach(function(path) {
	if (path.match(/\.jar$/) && !addToClasspath(module.resolve('../jars/' + path))) {
		throw new Error("Could not load jar '" + path + "'.");
	}
});

var {Application} = require("stick");
var response = require('ringo/jsgi/response');

var app = Application();

app.configure("session", "notfound", "error", "static", "params", "mount", "route", "render");
app.render.base = module.resolve("templates");
app.static(module.resolve("./public/"));

app.get("/", function(request) 
{
	var context = {};
	var resp = app.render("index.html", context);
	return resp;
});

app.get("/:id", function(request, id) {
	var baseUrl = request.scheme + "://" + request.host + ":" + request.port  + request.scriptName; // Dynamic callback URL

	var SocialAuthConfig = org.brickred.socialauth.SocialAuthConfig;
	var config = SocialAuthConfig.getDefault();
	var config_properties = require("./config/auth_properties.js");
	var byte_config = java.lang.String(config_properties.config_prop).getBytes();
	var prop = Packages.java.io.ByteArrayInputStream(byte_config);

	config.load(prop);
	prop.close();

	var manager = new Packages.org.brickred.socialauth.SocialAuthManager;
	manager.setSocialAuthConfig(config);

	var successUrl = baseUrl + "/success";
	var authenticationUrl = manager.getAuthenticationUrl(id, successUrl);

	request.session.data["authManager"] = manager;

	return response.redirect(authenticationUrl);
});

app.get("/success", function(request) {
	var baseUrl = request.scheme + "://" + request.host + ":" + request.port  + request.scriptName; // Url de Callback Dinâmica
	
	var context = {}
	var resp;
	var errorUrl = baseUrl + "/error";

	var manager = request.session.data["authManager"];

	try
	{	
		var SocialAuthUtil = Packages.org.brickred.socialauth.util.SocialAuthUtil;
		var req = request.env.servletRequest;
		var paramsMap = SocialAuthUtil.getRequestParametersMap(req);
		var provider = manager.connect(paramsMap);
		var javaProfile = provider.getUserProfile();
		var user = parseJavaObjectToJson(javaProfile);

		context["user"] = JSON.stringify(user);

		var resp = app.render("success.html", context);

		return resp;
	}
	catch(error)
	{
		print(error);
		resp = response.redirect("/error");
		return resp;
	}

});

app.get("/error", function(request) {
	return app.render("error.html", {});
});

var parseJavaObjectToJson = function(profileObject)
{
	var profile = {
		email: profileObject.getEmail(),
		firstName: profileObject.getFirstName() , 
		lastName: profileObject.getLastName() , 
		country: profileObject.getCountry() , 
		language: profileObject.getLanguage() , 
		fullName: profileObject.getFullName() , 
		displayName: profileObject.getDisplayName() ,
		dob: profileObject.getDob(), 
		gender: profileObject.getGender() , 
		location:  profileObject.getLocation() , 
		validatedId: profileObject.getValidatedId() , 
		profileImageURL: profileObject.getProfileImageURL() , 
		providerId: profileObject.getProviderId()
	};

	// removes all invalid fields (null or "").
	for(key in profile)
	{
		if(!profile[key] || profile[key] === '"null"' || profile[key] === '""') 
		{
			delete profile[key]
		}
	}

	if(profile.dob)
	{
		// Convert Date Java object to string field.
		profile.dob = profile.dob.toString();
	}

	return profile;
}

exports.app = app;

if (require.main === module) {
    require("ringo/httpserver").main(module.id);
}