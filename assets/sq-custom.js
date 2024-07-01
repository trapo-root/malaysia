window.sq.config.themeSettings.topBarFilters = true;

window.onload = function(){
  const rect = document.querySelector('[name="q"]').getClientRects()[0];
const dropdownBody = document.querySelector(".sq-app.sq-dropdown .sq-dropdown-body");
  setTimeout(()=>{
    console.log(window.innerWidth - rect.right);
  dropdownBody.style.right = (window.innerWidth - rect.right) + "px";
},1000); 
}



window.sq.leftInitial = (store) => {
  const leftInitialItems = store.filters.find(item => item.stFieldName === "option_intials_13qgamc3lwo5xyzb2vrnzdme")?.items?.sort((a, b) => {
    const cleanLabelA = a.displayLabel.replaceAll('- ', '').trim();
    const cleanLabelB = b.displayLabel.replaceAll('- ', '').trim();
    return cleanLabelA.localeCompare(cleanLabelB);
  }) ?? [];
  return leftInitialItems;
};


// Handles selection and optionally resorts if data might have changed
window.sq.leftSock = (store, selectedValue) => {
  const filter = store.filters.find(item => item.stFieldName === "option_intials_13qgamc3lwo5xyzb2vrnzdme");
  if (filter && filter.items) {
    let selectedItemLabel = null;
    filter.items.forEach(item => {
      if (item.displayLabel === selectedValue) {
        item.selected = true;
        selectedItemLabel = item.displayLabel;
      } else {
        item.selected = false;
      }
    });

    if (selectedItemLabel) {
      const baseUrl = window.location.href.split('?')[0];
      const queryParams = new URLSearchParams(window.location.search);
      queryParams.set("option_intials_13qgamc3lwo5xyzb2vrnzdme", selectedItemLabel);
      
      const newUrl = `${baseUrl}?${queryParams.toString()}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  }
};