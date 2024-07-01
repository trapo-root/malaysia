window.sq.config.themeSettings.topBarFilters = true;

window.onload = function(){
  const rect = document.querySelector('[name="q"]').getClientRects()[0];
const dropdownBody = document.querySelector(".sq-app.sq-dropdown .sq-dropdown-body");
  setTimeout(()=>{
    console.log(window.innerWidth - rect.right);
  dropdownBody.style.right = (window.innerWidth - rect.right) + "px";
},1000); 
}



window.sq.brandOptions = (store,textFacet) => {
  console.log(store);
  const leftInitialItems = store.filters.find(item => item.stFieldName === textFacet)?.items?.sort((a, b) => {
    const cleanLabelA = a.displayLabel.replaceAll('- ', '').trim();
    const cleanLabelB = b.displayLabel.replaceAll('- ', '').trim();
    return cleanLabelA.localeCompare(cleanLabelB);
  }) ?? [];
  return leftInitialItems;
};



// Handles selection and optionally resorts if data might have changed
window.sq.brandValue = (store, selectedValue,textFacet) => {
  const filter = store.filters.find(item => item.stFieldName === textFacet);
  
  if (filter && filter.items) {sq-filter-title-
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
      queryParams.set(textFacet, selectedItemLabel);
      
      const newUrl = `${baseUrl}?${queryParams.toString()}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  }
 
};
window.sq.brandSelected = function(){
  if(window.location.href.includes('tags_brand_u7o52s8y6lzdgk23zhoyn81w')) return true;
  return false;
}

document.querySelectorAll("[class*='sq-filter-title-']").forEach(e=>{
  e.addEventListener("click",(j)=>{
    console.log(j);
  })
})