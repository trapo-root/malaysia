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
    let location = window.location.href;
    let collectionHandle = location.split("/collections/")[1];
    if (
      url &&
      url.toLowerCase() ===
      "https://wwhvljue9gedqyi9xn1ld5dk-fast.searchtap.net/v2".toLowerCase()
    ) {
      const body = JSON.parse(data);
       body.facetCount = 1000; 
      }

      data = JSON.stringify(body);
    }
    send.call(this, data);
  };
})(XMLHttpRequest);