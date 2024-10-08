
/** Bundle Page Start **/
$(document).ready(function() {
    $(".collection-item input[type='checkbox']").prop("disabled", !1),
        $(window).on("beforeunload", function() {
            $(window).scrollTop(0);
        }),
        $(".tab").click(function() {
            $(".tab-content").removeClass("active-tab-content");
              var currentTabID = $(this).attr("data-id");
          
                $(".tab-content[data-id='" + $(this).attr("data-id") + "']").addClass("active-tab-content");
                $(".tab").removeClass("active-tab");
                $(this).parent().find(".tab").addClass("active-tab");
                $("#searchbar").val("").trigger("keyup");
          if(currentTabID == 'tab2'){
              $('#tab1').addClass('active-tab');
          }
          if(currentTabID == 'tab3'){
            $('#tab1').addClass('active-tab');
              $('#tab2').addClass('active-tab');
          }
                $("html, body").animate({
                    scrollTop: 0
                }, 500, "swing");
        }),
        $(window).scroll(function(event) {
            var height = $(window).height(),
                scroll = $(window).scrollTop();
            scroll > height ? $(".sticky-header").addClass("show") : $(".sticky-header").removeClass("show");
        }),
        $("#submit-btn").click(function() {
            let items = 1;
            /*$("#flexi-box-form")
                .find(":input:checked")
                .each(function () {
                    $(this).val() == "No" ? $(this).prop("disabled", !0) : ($(this).attr("name", "properties[_ITEM" + items + "]"), items++);
                }),
                $(this).submit();*/

            var available_ids = []; //array of 'varaint_id - qty'
            //the following loop was for my case, you need to change the DOM selector for yours
            $('#checkboxes input:checked').each(function() {
                var thisQty = 1;
                if (thisQty > 0) {
                    var xVarID = $(this).attr('data-pid');
                    var toPushItem = xVarID + '-' + thisQty;
                    available_ids.push(toPushItem);
                }
            }).promise().done(function() {
                console.log("All done");
                console.log(available_ids);
            }); //each qty ends      

            for (var i = 0; i < available_ids.length; i++) {

                (function(i) {
                    //we are applying setTimeout strategy to avoid fast looping what causes add to cart failure. 
                    setTimeout(function() {
                        console.log(available_ids[i]);
                        //splitting the available_ids
                        var formContents = available_ids[i].split('-');
                        //[0] returns the variant id to add to cart
                        //[1] returns the quantity to add to cart
                        var params = {
                            type: 'POST',
                            url: '/cart/add.js',
                            data: 'quantity=' + formContents[1] + '&id=' + formContents[0],
                            dataType: 'json',
                            success: function(line_item) {
                                console.log("success! - " + line_item.title);

                                console.log('---' + i + '-----');
                                var iteration_length = i + 1;
                                //if iteration length is equal to the total length - it means that we have
                                //reached the last item. Now we redirect to cart or may be show pop up
                                if (iteration_length == available_ids.length) {
                                    //redirect to cart or 
                                    //document.location.href = '/cart';
                                    //do whatever
                                }
                            },
                            error: function() {
                                console.log("fail");
                            }
                        };
                        $.ajax(params);
                    }, 1000 * i);
                    //1000*i means this code fires 1 seconds after each iteration which makes sure addition of add to cart is 
                    //successful
                }(i));
            }
        });
    const totalTabs = $(".tab").length;
    let checkboxes = $(".collection-item input[type='checkbox']");
    const initProdValues = {};
    checkboxes.each(function() {
            initProdValues[$(this).attr("id")] = $(this).val().trim();
        }),
        checkboxes.click(function() {
            const initProductValue = initProdValues[this.id];
            $(this).val().trim() !== initProductValue && location.reload();
            let currProduct = $(this).attr("data-id"),
                currProductDataId = $(this).attr("data-id-products"),
                nextTab = null,
                action = !0,
                currTabId = Number(currProductDataId.split("_")[1]),
                selectionLimit = $('.tab-content[data-id="tab' + currTabId + '"]').attr("data-product-limit");
            if (($(this).parents(".product-info").find(".added_to_cart").addClass("_hidden"), $(this).parents(".product-info").find(".product_counter").addClass("_hidden"), $(this).is(":checked"))) {
                $(this).parents(".product-info").find(".added_to_cart").removeClass("_hidden"), $(this).parents(".product-info").find(".product_counter").removeClass("_hidden");
                let productTitle = $(this).val().split(" SKU:")[0];
                $(".Message_Bar").removeClass("is-hidden"),
                    $(".Message_Bar p span").text(productTitle),
                    setTimeout(function() {
                        $(".Message_Bar").addClass("is-hidden"), $(".Message_Bar p span").text("");
                    }, 2500);
            }
            let n = $("[data-id=tab" + currTabId + "] input:checked").length;
            if (
                (n == selectionLimit ? $("[data-id=tab" + currTabId + "] input:not(:checked)").prop("disabled", !0) : ((action = !1), $("[data-id=tab" + currTabId + "] input:not(:checked)").prop("disabled", !1)),
                    n > selectionLimit && location.reload(),
                    n == selectionLimit ?
                    ($("#checkbox_count_" + currProductDataId).css("display", "inline-block"),
                      //$(".tab-item-" + currTabId).addClass("act-tab")
                     $("#tab" + currTabId).addClass("active-tab")
                      ) :
                    n > 0 ?
                    ($("#checkbox_count_" + currProductDataId).html(n)) :
                    $("#checkbox_count_" + currProductDataId).css("display", "none"),
                    action == !0)
            ) {
                let nextTab2 = `tab${currTabId + 1}`;
                $(`.tab[data-id='${nextTab2}']`).click(), $("#searchbar").val("").trigger("keyup"), $("html, body").animate({
                    scrollTop: 0
                }, 500, "swing");
            }
            $("#flexi-box-form input[type=checkbox]:checked").length == totalproductSelection ? $("#submit-btn").css("display", "inline-block") : $("#submit-btn").css("display", "none");
            var selVarPrice = parseInt($(this).data('price'));
            var selVarSalePrice = parseInt($(this).data('saleprice'));
            var mainPrice = parseInt($('.prd-price .dis_price').attr('data-mainprice'));
            var disPrice = parseInt($('.prd-price .money').attr('data-disprice'));
          console.log(selVarPrice);
          console.log(selVarSalePrice);
          console.log(mainPrice);
          console.log(disPrice);
            var finalMainPrice = selVarPrice + mainPrice;
          var finalDisPrice = selVarSalePrice + disPrice;
          console.log(finalMainPrice);
          console.log(finalDisPrice)
          $('.prd-price .dis_price').attr('data-mainprice', finalMainPrice);
          $('.prd-price .money').attr('data-disprice', finalDisPrice);
          var finalMainPrice = window.Shopify.formatMoney(finalMainPrice, $('body').data('money-format'));
          var finalDisPrice = window.Shopify.formatMoney(finalDisPrice, $('body').data('money-format'));
		 $('.prd-price .dis_price').html(finalMainPrice);
          $('.prd-price .money').html(finalDisPrice);
        }),

        $(document).keydown(function(e) {
            if (e.which === 123) return !1;
        }),
        $("#searchbar").on("keyup", function() {
            var value = $(this).val().toLowerCase();
            $("#collection-list li").filter(function() {
                $(this).toggle($(this).find("a").text().toLowerCase().indexOf(value) > -1);
            });
        }),
        $(".search-clear").click(function(e) {
            $("#searchbar").val("").trigger("keyup");
        });
});

/** Bundle Page End **/