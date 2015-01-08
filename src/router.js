require('polyfill-function-prototype-bind');
var bodyDelegate = require('dom-delegate')();
document.addEventListener('DOMContentLoaded',function(){
  bodyDelegate.root(document.body);
},false);

function Router(options) {
    var self = this;
    options = options || [];
    this._routes = [];
    this.current = {
      route: null,
      params: null
    };

    if(options.routes) {
      for(var id in options.routes){
        this.add(options.routes[id],id);
      }
    }
    this.base = '';
    if(options.base){
      this.base = options.base;
      if(this.base[0] !== '/')
        this.base = '/' + this.base;
      if(this.base[this.base.length-1] === '/')
        this.base = this.base.substr(0,this.base.length-1);
    }
    if(typeof options.callback === 'function') {
      this._callback = options.callback;
    }

    // override default click intercept, if wanted
    if(typeof options.startClickIntercept === 'function'){
      self.startClickIntercept = startClickIntercept.bind(self);
    }
    if(typeof options.stopClickIntercept === 'function'){
      self.stopClickIntercept = stopClickIntercept.bind(self);
    }

    if(typeof options.html5 === 'undefined') options.html5 = true;
    if(options.html5 === true && 'onpopstate' in window){
      this.html5 = true;
      window.addEventListener('popstate',function RouterOnPopState(ev){
        self.set(ev.state.url,true);
      });
    } else {
      this.html5 = false;
      window.addEventListener('hashchange',function RouterOnHashChange(ev){
        self.set(window.location.hash.substr(1),true);
      });
    }
    if(this.html5 || options.interceptClicks){
      self.startClickIntercept();
    }
}

Router.prototype.normalize = function(url){
  url = url || '/';
  if(url[0] === '#') {
    url = url.substr(1);
  }
  if(url.startsWith(location.origin)){
    url = url.substr(location.origin.length);
  }
  if(url.startsWith(this.base)){
    url = url.substr(this.base.length);
  }
  if(url[0] !== '/') url = '/' + url;
  if(url.length > 1 && url[url.length-1] === '/') url = url.substr(0,url.length-1);
  return url;
};

Router.prototype.add = function RouterAdd(route,callback) {
  route = this.normalize(route);
  var i,normalizedRoute = route;
  
  // check if route already exists
  for(i = 0, len = this._routes.length; i<len; i++){
    if(this._routes[i].route === normalizedRoute) {
      this._routes[i] = callback || this._callback;
      return;
    }
  }

  // check for 'otherwise' route
  if(route === '/*') {
    this._otherwise = callback || this._callback;
    return route;
  }

  // add route
  var keys;
  var params = route.match(/:[a-zA-Z0-9]+/g) || [];
  keys = params.map(function(key){
    return key.substr(1);
  });
  for (i = params.length - 1; i >= 0; i--) {
    route = route.replace(params[i],'([^\/]+)');
  }
  route = '^' + route.replace(/\//g,'\\/') + '$';

  this._routes.push({
    route: normalizedRoute,
    regex: new RegExp(route),
    params: keys,
    callback: callback || this._callback
  });
  return route;
};

Router.prototype.setCallback = function RouterSetCallback(fn){
  this._callback = fn;
};

Router.prototype.set = function RouterSet(url,silent) {
  var current = this.html5? location.href: location.hash.substr(1);
  url = this.normalize(url || current);
  if(this.html5 && !silent){
    history.pushState({url:url},url,url);
  } else if(!silent){
    location.hash = url;
  }
  var found = false,
      i = this._routes.length - 1,
      matches,
      params = {};

  while(i >= 0 && !found) {
    matches = url.match(this._routes[i].regex);
    if(matches !== null) {
      found = true;
      matches = matches.splice(1);
      this._routes[i].params.forEach(function(key){
        params[key] = matches[key];
      });
      this._routes[i].callback(params,this._routes[i].route);
      this.current.route = this._routes[i].route;
      this.current.params = params;
    }
    i--;
  }
  if(!found && this._otherwise) {
    this._otherwise(params,'/*');
    found = true;
  }
  return found;
};

Router.prototype.interceptClick = function(ev){
  var url = ev.target.getAttribute('href');
  if(url){
    url = this.normalize(url);
    if(url.substr(0,4) !== 'http') {
      if(this.html5){
        history.pushState({url:url},url,url);
      } else {
        location.hash = url;
      }
      ev.preventDefault();
    }
  }
};

Router.prototype.startClickIntercept = function(){
  bodyDelegate.on('click','a',this.interceptClick.bind(this));
  window.del = bodyDelegate;
};


Router.prototype.stopClickIntercept = function(){
  bodyDelegate.destroy();
};

module.exports = Router;