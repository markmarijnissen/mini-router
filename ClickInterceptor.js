require('polyfill-function-prototype-bind');
var bodyDelegate = require('dom-delegate')(document.body);

var options = {
  html5: false,
  base: '',
  normalize: function normalize(url) { return url; }
};

document.addEventListener('DOMContentLoaded',function(){
  bodyDelegate.root(document.body);
},false);

function clickHandler(ev){
  var url = ev.target.getAttribute('href');
  if(url){
    url = options.normalize(url);
    if(url.substr(0,4) !== 'http') {
      if(options.html5){
        history.pushState({url:url},url,url);
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