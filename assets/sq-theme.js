function toggleFilter() {
    let x = document.querySelector(".sq-filter-main");
    x.classList.toggle("opening");
}
function toggleClass() {
    let y = document.querySelector(".sq-filter-main");
    y.classList.remove("opening");
}
function removeClass() {
    let z = document.querySelector(".sq-filter-main");
    z.classList.remove("opening");
}

window.sq = window.sq || {};


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
   
    if (
      url &&
      url.toLowerCase() ===
        "https://wwhvljue9gedqyi9xn1ld5dk-fast.searchtap.net/v2".toLowerCase() //v2 link
    ) {
      const body = JSON.parse(data);
      //logic
       body.facetCount = 1000; 
      data = JSON.stringify(body);
    }
    send.call(this, data);
  };
})(XMLHttpRequest);
window.addEventListener("load", () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
        document
            .getElementById("Search-In-Modal")
            .addEventListener("focusin", () => {
                document.querySelector(".sq-dropdown-body").style.maxHeight = "100%";
            });
        document
            .getElementById("Search-In-Modal")
            .addEventListener("focusout", () => {
                document.querySelector(".sq-dropdown-body").style.maxHeight = "0px";
            });
    }
});

window.sq.getStore = (store) => {
  store.filters.forEach((e) => {
    if (typeof e.displayName === "string" && e.displayName.includes("Type of Car Mat")) {
      e.items[0].displayLabel = "2D Mat"
      e.items[2].displayLabel = "3D Mat";
    }
  }); 
  return true;
}

window.sq.initSearch = (store) => {
    store.search();
};


setTimeout(()=>{
    if(document.querySelector(".sq-filter-main")) document.querySelector(".sq-filter-main").style.visibility=null;
    if(document.querySelector(".sparq-container")) document.querySelector(".sparq-container").style.visibility=null;
},200);

window.addEventListener("keydown",(e)=>{
    if (e.key === "Escape") {
        document.querySelector("footer").click();
    }
});



