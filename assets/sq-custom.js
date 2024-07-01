window.sq.config.themeSettings.topBarFilters = true;

if(window.href.includes("/collections")) {
  
}

(function (XHR) {
  "use strict";

  var open = XHR.prototype.open;
  var send = XHR.prototype.send;

  XHR.prototype.open = function (method, url, async, user, pass) {
    this._url = url;
    open.call(this, method, url, async, user, pass);
  };

  XHR.prototype.send = function (data) {
    var self = this;
    var url = this._url;
     
      body.facetCount = 1000;  
      data = JSON.stringify(body);
    }
    send.call(this, data);
  };
})(XMLHttpRequest);