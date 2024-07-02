window.sq.config.themeSettings.topBarFilters = true;

window.onload = function () {
  const rect = document.querySelector('[name="q"]').getClientRects()[0];
  const dropdownBody = document.querySelector(
    ".sq-app.sq-dropdown .sq-dropdown-body"
  );
  setTimeout(() => {
    console.log(window.innerWidth - rect.right);
    dropdownBody.style.right = window.innerWidth - rect.right + "px";
  }, 1000);
};

// window.sq.brandOptions = (store,textFacet) => {
//   console.log(store);
//   const leftInitialItems = store.filters.find(item => item.stFieldName === textFacet)?.items?.sort((a, b) => {
//     const cleanLabelA = a.displayLabel.replaceAll('- ', '').trim();
//     const cleanLabelB = b.displayLabel.replaceAll('- ', '').trim();
//     return cleanLabelA.localeCompare(cleanLabelB);
//   }) ?? [];
//   return leftInitialItems;
// };

// // Handles selection and optionally resorts if data might have changed
// window.sq.brandValue = (store, selectedValue,textFacet) => {
//   const filter = store.filters.find(item => item.stFieldName === textFacet);

//   if (filter && filter.items) {sq-filter-title-
//     let selectedItemLabel = null;
//     filter.items.forEach(item => {
//       if (item.displayLabel === selectedValue) {
//         item.selected = true;
//         selectedItemLabel = item.displayLabel;
//       } else {
//         item.selected = false;
//       }
//     });

//     if (selectedItemLabel) {
//       const baseUrl = window.location.href.split('?')[0];
//       const queryParams = new URLSearchParams(window.location.search);
//       queryParams.set(textFacet, selectedItemLabel);

//       const newUrl = `${baseUrl}?${queryParams.toString()}`;
//       window.history.pushState({ path: newUrl }, '', newUrl);
//     }
//   }

// };
// window.sq.brandSelected = function(){
//   if(window.location.href.includes('tags_brand_u7o52s8y6lzdgk23zhoyn81w')) return true;
//   return false;
// }

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
  console.log(store.currentPage, store.totalPages);
  const breadcrumbElement = document.querySelector(".breadcrumb_text");
  if (breadcrumbElement) {
    const breadcrumbText = breadcrumbElement.textContent.trim();
    const match = breadcrumbText.match(/Page \d+ of \d+/);

    if (match) {
      const oldText = match[0];
      const newText = oldText.replace(/Page \d+/, "Page 3");
      breadcrumbElement.innerHTML = breadcrumbElement.innerHTML.replace(
        oldText,
        newText
      );
      console.log("Updated text:", newText); // Outputs: "Page 3 of 86"
    } else {
      console.log("Pattern not found in the breadcrumb text.");
    }
  } else {
    return true;
    console.log("Breadcrumb element not found.");
  }
  return true;
};
