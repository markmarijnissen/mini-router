require('polyfill-function-prototype-bind');
var bodyDelegate = require('dom-delegate')(document.body);

var options = {
  html5: false,
  base: '',
  normalize: function normalize(url) { return url; },
  set: function(url){}
};

document.addEventListener('DOMContentLoaded',function(){
  bodyDelegate.root(document.body);
},false);

function clickHandler(ev){
  var url = ev.target.getAttribute('href');
  if(url){
    if(url.substr(0,4) !== 'http') {
      url = options.normalize(url);
      if(options.html5){
        if(options.set) {
          options.set(url);
        } else {
          history.pushState({url:url},url,url);
        }
      } else {
        location.hash = url;
      }
      ev.preventDefault();
    }
  }
}

function stopClickInterceptor(){
  bodyDelegate.destroy();
}

function ClickInterceptor(_options){
  for(var key in _options){
    options[key] = _options[key];
  }
  bodyDelegate.on('click','a',clickHandler);
}

ClickInterceptor.stop = stopClickInterceptor;

window.ClickInterceptor = ClickInterceptor;
module.exports = ClickInterceptor;