require('polyfill-function-prototype-bind');
var bodyDelegate = require('dom-delegate')();
document.addEventListener('DOMContentLoaded',function(){
  bodyDelegate.root(document.body);
},false);

function Router(options) {
    var self = this;
    options = options || [];
    this._routes = [];

    if(options.routes) {
      for(var id in options.routes){
        this.add(options.routes[id],id);
      }
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
      window.addEventListener('popstate',function(ev){
        self.set(ev.state.url);
      });
      self.startClickIntercept();
    } else {
      this.html5 = false;
      window.addEventListener('hashchange',function(ev){
        self.set(window.location.hash.substr(1));
      });
    }
}

Router.prototype.normalize = function(url){
  url = url || '/';
  url = url.replace(location.origin,'');
  if(url[0] !== '/') url = '/' + url;
  if(url.length > 1 && url[url.length-1] === '/') url = url.substr(0,url.length-1);
  return url;
};

Router.prototype.add = function RouterAdd(route,callback) {
  route = this.normalize(route);
  if(route === '/*') {
    this._otherwise = callback;
    return route;
  }
  var keys;
  var params = route.match(/:[a-zA-Z0-9]+/g) || [];
  keys = params.map(function(key){
    return key.substr(1);
  });
  for (var i = params.length - 1; i >= 0; i--) {
    route = route.replace(params[i],'([^\/]+)');
  }
  route = '^' + route.replace(/\//g,'\\/') + '$';

  this._routes.push({
    regex: new RegExp(route),
    params: keys,
    callback: callback
  });
  return route;
};

Router.prototype.set = function RouterSet(url) {
  url = this.normalize(url || location.href);
  if(this.html5){
    history.pushState({url:url},url,url);
  } else {
    location.hash = url;
  }
  var found = false,
      i = this._routes.length - 1,
      matches,
      params = null;

  while(i >= 0 && !found) {
    matches = url.match(this._routes[i].regex);
    if(matches !== null) {
      found = true;
      matches = matches.splice(1);
      params = this._routes[i].params.map(function(key){
        return matches[key];
      });
      this._routes[i].callback(params);
    }
    i--;
  }
  if(!found && this._otherwise) {
    this._otherwise();
    found = true;
  }
  return found;
};

Router.prototype.interceptClick = function(ev){
  var url = ev.target.getAttribute('href');
  if(url){
    url = this.normalize(url);
    if(url.substr(0,4) !== 'http' && this.set(url)) {
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