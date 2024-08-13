window.sq.config.themeSettings.topBarFilters = true;

window.onload = function () {
  const rect = document.querySelector('[name="q"]').getClientRects()[0];
  const dropdownBody = document.querySelector(
    ".sq-app.sq-dropdown .sq-dropdown-body"
  );
  setTimeout(() => {
    // console.log(window.innerWidth - rect.right);
    dropdownBody.style.right = window.innerWidth - rect.right + "px";
  }, 1000);
};

window.onload = function () {
  document.querySelectorAll("[class*='sq-filter-title-']").forEach((e) => {
    e.addEventListener("click", (j) => {
      if (j.target.closest(".sq-filter-dropdown")) {
        const parentClass = j.target.closest(".sq-filter-dropdown");
        if (parentClass.classList.contains("open")) {
          parentClass.classList.add("close");
          parentClass.classList.remove("open");
        } else if (parentClass.classList.contains("close")) {
          parentClass.classList.add("open");
          parentClass.classList.remove("close");
        } else parentClass.classList.add("open");
      }
    });
  });
};
window.sq.updatePage = function (store) {
  // console.log(store.currentPage, store.totalPages);
    const breadcrumbElement = document.querySelector(".breadcrumb_text");

  if (breadcrumbElement) {
    const breadcrumbText = breadcrumbElement.textContent.trim();
    const match = breadcrumbText.match(/Page \d+ of \d+/);

    if (match && !isNaN(store.totalPages)) {
      const oldText = match[0];
      const newPageNumber = store.currentPage; // Update with the new page number
      const newTotalPages = store.totalPages; // Update with the new total pages
      const newText = oldText
        .replace(/Page \d+/, `Page ${newPageNumber}`)
        .replace(/of \d+/, `of ${newTotalPages}`);
      breadcrumbElement.innerHTML = breadcrumbElement.innerHTML.replace(
        oldText,
        newText
      );
      // console.log("Updated text:", newText); // Outputs: "Page 3 of 100"
    } else {
      // console.log("Pattern not found in the breadcrumb text.");
    }
  } else {
    return true;
    // console.log("Breadcrumb element not found.");
  }
  return true;
};

//for homepage
window.sq.udpateSelection = function(store) {
  store.filters.map(f=>{
     setTimeout(()=>{
       updateSelectedValue(f,"tags_brand_u7o52s8y6lzdgk23zhoyn81w");
       updateSelectedValue(f,"tags_model_yid1zsi8u8ok6nozp2vb5zg9");
       updateSelectedValue(f,"tags_model_cx9fhj5cuqpozs1ac828aoho");
     },100)
  })
  return true;
}

document.addEventListener("click",(e)=>{
  if(!e.target.closest(".sq-home")) return true;
  if(e.target.closest(".sq-filter-value")){
    let element = e.target.closest(".sq-filter-value");
    let parentGroup  =  element.closest(`.sq-filter-dropdown`);
    let filterTitleElm = parentGroup.querySelector(`[class*="sq-filter-title-"]`);
    let DropDownBody = e.target.closest(".sq-dropdown-body.sq-opened");
    DropDownBody.classList.remove("sq-opened");
    filterTitleElm.innerHTML = element.innerText;
  }
})

function updateSelectedValue(f,stFieldName){
  if(f.stFieldName==stFieldName && f.items){
      f.items.map(i=>{
        if(i.selected){
          document.querySelector(`.sq-filter-group-${f.stFieldName} [class*=sq-filter-title-]`).innerHTML = i.displayLabel;
        }
      })
    }
}

window.sq.okendoRating = async function(item) {
    try {
        const response = await fetch(`/products/${item.handle}?view=sparq`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
       let text = await response.text();  // Get the raw response text
      let data = text.replace(/^\s*{\s*"reviewHTML"\s*:\s*|\s*}\s*$/g, '').replace(/\n\s*/g, '');
      let sprqCard = document.querySelector(`.sparq-card[product-handle="${item.handle}"]`);
      let reviewElement = sprqCard.querySelector(".product-rating");
      if(reviewElement) reviewElement.innerHTML = data;
      console.log(data);
    } catch (error) {
        console.error('There was an error fetching the metafields:', error);
    }
  return true;
}







