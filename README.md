mini-router
-----------

## Install
```bash
npm install mini-router
bower install mini-router
```

## Usage
```javascript
var router = new Router({
	html5: true // default true if browser supports it
	routes: { '/some/route': callback } // optional routes
	startClickIntercept: fn // optional custom click intercept handler
	stopClickIntercept: fn // optional destruction of your custom click intercept handler
})

// Define and handle route. You can use :named parameters.
router.add('/route/:param1',function(params){
	// handle your route
	console.log(params.param1);
});

// Manually set location and fire route handler
router.set(url)

// Normalize URL; 
// - remove domain name.
router.normalize('http://yourwebsite.com/some/path/') // /some/path
// - remove ending slash
router.normalize('/some/path/') // /some/path
// - add prepending slash
router.normalize('some/path') // /some/path
```

## Why?

It seems that you only listen to **history** events. There is no event fired when the user navigates to a new location.

So we have to intercept click events. However, no [micro router library](http://microjs.com/#router) has this functionality.

So I wrote this one!

## Changelog

* 0.1.0: Initial release

## Contribute

Feel free to contribute to this project in any way. The easiest way to support this project is by giving it a star.

## Contact
-   @markmarijnissen
-   http://www.madebymark.nl
-   info@madebymark.nl

© 2014 - Mark Marijnissen