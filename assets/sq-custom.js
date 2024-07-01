window.sq.config.themeSettings.topBarFilters = true;

if(window.href.includes("/collections")) {
  
}

window.onload = function(){
  const rect = document.querySelector('[name="q"]').getClientRects()[0];
const dropdownBody = document.querySelector(".sq-app.sq-dropdown .sq-dropdown-body");
  setTimeout(()=>{
  dropdownBody.style.right = ((rect.right - rect-left) + 10) + "px";
},200); 
}

