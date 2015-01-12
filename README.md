mini-router
-----------

## Install
```bash
npm install mini-router
bower install mini-router
```

## Files

* `dist/click-interceptor.js` - ClickInterceptor (standalone library, exported as global var)
* `dist/mini-router.core.js` - Router without ClickInterceptor (standalone library)
* `dist/mini-router.js` - Router + ClickInterceptor (standalone library)
* `router.js` - CommonJS module (use with webpack or browserify)
* `ClickInterceptor.js` - CommonJS module 

## Usage
```javascript
var router = new Router({
	html5: true // default true if browser supports it
	base: '' // optional base url (gets stripped away when routing)
	routes: { '/some/route': callback } // optional routes
	clickInterceptor: ClickInterceptor // override or set the ClickInterceptor
})

// Define and handle route. You can use :named parameters.
router.add('/route/:param1',function(params){
	// handle your route
	console.log(params.param1);
});
// Note: If you define multiple routes with the same name, only the latest callback is called!

// Manually set location and fire route handler
router.set(url)

// Normalize URL; 
// - remove domain name.
router.normalize('http://yourwebsite.com/some/path/') // /some/path
// - remove ending slash
router.normalize('/some/path/') // /some/path
// - add prepending slash
router.normalize('some/path') // /some/path

// You can also only use the click interceptor.
// It translates link-clicks to hash-changes or html5 popState()
ClickInterceptor({
	html5: true,
	base: '',
	normalize: function(url){
		return url;
	}
});
```

## Why?

It seems that you only listen to **history** events. There is no event fired when the user navigates to a new location.

So we have to intercept click events. However, no [micro router library](http://microjs.com/#router) has this functionality.

So I wrote this one!

## Changelog

* 0.3.0: Fixed some versioning issues with NPM and Bower
* 0.2.0: Split Router into Router + ClickInterceptor. Some minor improvements.
* 0.1.0: Initial release

## Contribute

Feel free to contribute to this project in any way. The easiest way to support this project is by giving it a star.

## Contact
-   @markmarijnissen
-   http://www.madebymark.nl
-   info@madebymark.nl

© 2014 - Mark Marijnissen