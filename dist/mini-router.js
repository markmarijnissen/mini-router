var ClickInterceptor = function(modules) {
    var installedModules = {};
    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) return installedModules[moduleId].exports;
        var module = installedModules[moduleId] = {
            exports: {},
            id: moduleId,
            loaded: false
        };
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.loaded = true;
        return module.exports;
    }
    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.p = "";
    return __webpack_require__(0);
}([ function(module, exports, __webpack_require__) {
    __webpack_require__(1);
    var bodyDelegate = __webpack_require__(2)(document.body);
    var options = {
        html5: false,
        base: "",
        normalize: function normalize(url) {
            return url;
        },
        set: function(url) {}
    };
    document.addEventListener("DOMContentLoaded", function() {
        bodyDelegate.root(document.body);
    }, false);
    function clickHandler(ev) {
        var url = ev.target.getAttribute("href");
        if (url) {
            if (url.substr(0, 4) !== "http") {
                url = options.normalize(url);
                if (options.html5) {
                    if (options.set) {
                        options.set(url);
                    } else {
                        history.pushState({
                            url: url
                        }, url, url);
                    }
                } else {
                    location.hash = url;
                }
                ev.preventDefault();
            }
        }
    }
    function stopClickInterceptor() {
        bodyDelegate.destroy();
    }
    function ClickInterceptor(_options) {
        for (var key in _options) {
            options[key] = _options[key];
        }
        bodyDelegate.on("click", "a", clickHandler);
    }
    ClickInterceptor.stop = stopClickInterceptor;
    window.ClickInterceptor = ClickInterceptor;
    module.exports = ClickInterceptor;
}, function(module, exports) {
    if (!Function.prototype.bind) {
        Function.prototype.bind = function(oThis) {
            if (typeof this !== "function") {
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }
            var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function() {}, fBound = function() {
                return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
            };
            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();
            return fBound;
        };
    }
}, function(module, exports, __webpack_require__) {
    "use strict";
    var Delegate = __webpack_require__(3);
    module.exports = function(root) {
        return new Delegate(root);
    };
    module.exports.Delegate = Delegate;
}, function(module, exports) {
    "use strict";
    module.exports = Delegate;
    function Delegate(root) {
        this.listenerMap = [ {}, {} ];
        if (root) {
            this.root(root);
        }
        this.handle = Delegate.prototype.handle.bind(this);
    }
    Delegate.prototype.root = function(root) {
        var listenerMap = this.listenerMap;
        var eventType;
        if (this.rootElement) {
            for (eventType in listenerMap[1]) {
                if (listenerMap[1].hasOwnProperty(eventType)) {
                    this.rootElement.removeEventListener(eventType, this.handle, true);
                }
            }
            for (eventType in listenerMap[0]) {
                if (listenerMap[0].hasOwnProperty(eventType)) {
                    this.rootElement.removeEventListener(eventType, this.handle, false);
                }
            }
        }
        if (!root || !root.addEventListener) {
            if (this.rootElement) {
                delete this.rootElement;
            }
            return this;
        }
        this.rootElement = root;
        for (eventType in listenerMap[1]) {
            if (listenerMap[1].hasOwnProperty(eventType)) {
                this.rootElement.addEventListener(eventType, this.handle, true);
            }
        }
        for (eventType in listenerMap[0]) {
            if (listenerMap[0].hasOwnProperty(eventType)) {
                this.rootElement.addEventListener(eventType, this.handle, false);
            }
        }
        return this;
    };
    Delegate.prototype.captureForType = function(eventType) {
        return [ "blur", "error", "focus", "load", "resize", "scroll" ].indexOf(eventType) !== -1;
    };
    Delegate.prototype.on = function(eventType, selector, handler, useCapture) {
        var root, listenerMap, matcher, matcherParam;
        if (!eventType) {
            throw new TypeError("Invalid event type: " + eventType);
        }
        if (typeof selector === "function") {
            useCapture = handler;
            handler = selector;
            selector = null;
        }
        if (useCapture === undefined) {
            useCapture = this.captureForType(eventType);
        }
        if (typeof handler !== "function") {
            throw new TypeError("Handler must be a type of Function");
        }
        root = this.rootElement;
        listenerMap = this.listenerMap[useCapture ? 1 : 0];
        if (!listenerMap[eventType]) {
            if (root) {
                root.addEventListener(eventType, this.handle, useCapture);
            }
            listenerMap[eventType] = [];
        }
        if (!selector) {
            matcherParam = null;
            matcher = matchesRoot.bind(this);
        } else if (/^[a-z]+$/i.test(selector)) {
            matcherParam = selector;
            matcher = matchesTag;
        } else if (/^#[a-z0-9\-_]+$/i.test(selector)) {
            matcherParam = selector.slice(1);
            matcher = matchesId;
        } else {
            matcherParam = selector;
            matcher = matches;
        }
        listenerMap[eventType].push({
            selector: selector,
            handler: handler,
            matcher: matcher,
            matcherParam: matcherParam
        });
        return this;
    };
    Delegate.prototype.off = function(eventType, selector, handler, useCapture) {
        var i, listener, listenerMap, listenerList, singleEventType;
        if (typeof selector === "function") {
            useCapture = handler;
            handler = selector;
            selector = null;
        }
        if (useCapture === undefined) {
            this.off(eventType, selector, handler, true);
            this.off(eventType, selector, handler, false);
            return this;
        }
        listenerMap = this.listenerMap[useCapture ? 1 : 0];
        if (!eventType) {
            for (singleEventType in listenerMap) {
                if (listenerMap.hasOwnProperty(singleEventType)) {
                    this.off(singleEventType, selector, handler);
                }
            }
            return this;
        }
        listenerList = listenerMap[eventType];
        if (!listenerList || !listenerList.length) {
            return this;
        }
        for (i = listenerList.length - 1; i >= 0; i--) {
            listener = listenerList[i];
            if ((!selector || selector === listener.selector) && (!handler || handler === listener.handler)) {
                listenerList.splice(i, 1);
            }
        }
        if (!listenerList.length) {
            delete listenerMap[eventType];
            if (this.rootElement) {
                this.rootElement.removeEventListener(eventType, this.handle, useCapture);
            }
        }
        return this;
    };
    Delegate.prototype.handle = function(event) {
        var i, l, type = event.type, root, phase, listener, returned, listenerList = [], target, EVENTIGNORE = "ftLabsDelegateIgnore";
        if (event[EVENTIGNORE] === true) {
            return;
        }
        target = event.target;
        if (target.nodeType === 3) {
            target = target.parentNode;
        }
        root = this.rootElement;
        phase = event.eventPhase || (event.target !== event.currentTarget ? 3 : 2);
        switch (phase) {
          case 1:
            listenerList = this.listenerMap[1][type];
            break;

          case 2:
            if (this.listenerMap[0] && this.listenerMap[0][type]) listenerList = listenerList.concat(this.listenerMap[0][type]);
            if (this.listenerMap[1] && this.listenerMap[1][type]) listenerList = listenerList.concat(this.listenerMap[1][type]);
            break;

          case 3:
            listenerList = this.listenerMap[0][type];
            break;
        }
        l = listenerList.length;
        while (target && l) {
            for (i = 0; i < l; i++) {
                listener = listenerList[i];
                if (!listener) {
                    break;
                }
                if (listener.matcher.call(target, listener.matcherParam, target)) {
                    returned = this.fire(event, target, listener);
                }
                if (returned === false) {
                    event[EVENTIGNORE] = true;
                    event.preventDefault();
                    return;
                }
            }
            if (target === root) {
                break;
            }
            l = listenerList.length;
            target = target.parentElement;
        }
    };
    Delegate.prototype.fire = function(event, target, listener) {
        return listener.handler.call(target, event, target);
    };
    var matches = function(el) {
        if (!el) return;
        var p = el.prototype;
        return p.matches || p.matchesSelector || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector;
    }(Element);
    function matchesTag(tagName, element) {
        return tagName.toLowerCase() === element.tagName.toLowerCase();
    }
    function matchesRoot(selector, element) {
        if (this.rootElement === window) return element === document;
        return this.rootElement === element;
    }
    function matchesId(id, element) {
        return id === element.id;
    }
    Delegate.prototype.destroy = function() {
        this.off();
        this.root();
    };
} ]);

function Router(options) {
    var self = this;
    options = options || [];
    this._routes = [];
    this.current = {
        route: null,
        params: null
    };
    if (options.routes) {
        for (var id in options.routes) {
            this.add(options.routes[id], id);
        }
    }
    this.base = "";
    if (options.base) {
        this.base = options.base;
        if (this.base[0] !== "/") this.base = "/" + this.base;
        if (this.base[this.base.length - 1] === "/") this.base = this.base.substr(0, this.base.length - 1);
    }
    if (typeof options.callback === "function") {
        this._callback = options.callback;
    }
    if (typeof options.html5 === "undefined") options.html5 = true;
    if (options.html5 === true && "onpopstate" in window) {
        this.html5 = true;
        window.addEventListener("popstate", function RouterOnPopState(ev) {
            self.set(ev.state.url, true);
        });
    } else {
        this.html5 = false;
        window.addEventListener("hashchange", function RouterOnHashChange(ev) {
            self.set(window.location.hash.substr(1), true);
        });
    }
    if (options.clickInterceptor || window.ClickInterceptor) {
        this.setClickInterceptor(options.clickInterceptor || window.ClickInterceptor);
    }
}

Router.prototype.normalize = function(url) {
    url = url || "/";
    if (url[0] === "#") {
        url = url.substr(1);
    }
    if (url.substr(0, location.origin.length) === location.origin) {
        url = url.substr(location.origin.length);
    }
    if (url.substr(0, this.base.length) === this.base) {
        url = url.substr(this.base.length);
    }
    if (url[0] !== "/") url = "/" + url;
    if (url.length > 1 && url[url.length - 1] === "/") url = url.substr(0, url.length - 1);
    return url;
};

Router.prototype.add = function RouterAdd(route, callback) {
    route = this.normalize(route);
    callback = callback || this._callback;
    var i, normalizedRoute = route;
    for (i = 0, len = this._routes.length; i < len; i++) {
        if (this._routes[i].route === normalizedRoute) {
            this._routes[i].callback = callback;
            return;
        }
    }
    if (route === "/*") {
        this._otherwise = callback;
        return route;
    }
    var keys;
    var params = route.match(/:[a-zA-Z0-9]+/g) || [];
    keys = params.map(function(key) {
        return key.substr(1);
    });
    for (i = params.length - 1; i >= 0; i--) {
        route = route.replace(params[i], "([^/]+)");
    }
    route = "^" + route.replace(/\//g, "\\/") + "$";
    this._routes.push({
        route: normalizedRoute,
        regex: new RegExp(route),
        params: keys,
        callback: callback
    });
    return route;
};

Router.prototype.setClickInterceptor = function(interceptor) {
    interceptor(this);
};

Router.prototype.setCallback = function RouterSetCallback(fn) {
    this._callback = fn;
};

Router.prototype.set = function RouterSet(url, silent) {
    var current = this.html5 ? location.href : location.hash.substr(1);
    url = this.normalize(url || current);
    if (this.html5 && !silent) {
        var fullUrl = this.base ? this.base + url : url;
        history.pushState({
            url: fullUrl
        }, fullUrl, fullUrl);
    } else if (!silent) {
        location.hash = url;
    }
    var found = false, i = this._routes.length - 1, matches, params = {};
    while (i >= 0 && !found) {
        matches = url.match(this._routes[i].regex);
        if (matches !== null) {
            found = true;
            matches = matches.splice(1);
            this._routes[i].params.forEach(function(key, index) {
                params[key] = matches[index];
            });
            this._routes[i].callback(params, this._routes[i].route);
            this.current.route = this._routes[i].route;
            this.current.params = params;
        }
        i--;
    }
    if (!found && this._otherwise) {
        this._otherwise(params, "/*");
        found = true;
    }
    return found;
};

if (module) {
    module.exports = Router;
} else {
    window.Router = Router;
}