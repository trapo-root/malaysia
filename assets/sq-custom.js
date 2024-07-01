window.sq.config.themeSettings.topBarFilters = true;

window.onload = function(){
  const rect = document.querySelector('[name="q"]').getClientRects()[0];
const dropdownBody = document.querySelector(".sq-app.sq-dropdown .sq-dropdown-body");
  setTimeout(()=>{
    console.log(window.innerWidth - rect.right);
  dropdownBody.style.right = (window.innerWidth - rect.right) + "px";
},1000); 
}

