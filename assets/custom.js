// ====================== MEGANTIC SUBCATEGORIES JS =========================== 
document.addEventListener('DOMContentLoaded', function() {
    var dropdownButton = document.querySelector('.mgc-subcategories-button');
    var dropdownContent = document.querySelector('.mgc-subcategories-dropdown');
    var accordion = document.querySelector('.accordion');
    var panel = document.querySelector('.panel');

    dropdownButton.addEventListener('click', function(event) {
        event.stopPropagation(); 
        dropdownContent.classList.toggle('show');
    });

    window.addEventListener('click', function() {
        if (dropdownContent.classList.contains('show')) {
            dropdownContent.classList.remove('show');
        }
    });

    dropdownContent.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    accordion.addEventListener('click', function() {
        this.classList.toggle('active');
        panel.classList.toggle('show');
    });
});
/** Start Check Ultimate Hex & Xtreme Product **/
 $(document).ready(function(){
		var currentProductHandle  = $(".product_form").attr("data-product-handle");
		//var lastItem = currentProductHandle.split("-").pop();
		//console.log(currentProductHandle);
		var xtremeHandle = "xtreme-3d-car-mat";
		var ultimateHandle = "hex-ultimate";
		if(currentProductHandle.indexOf(xtremeHandle) != -1){
			var lastItem = currentProductHandle.split("-").slice(-4).join("-");
		}else if(currentProductHandle.indexOf(ultimateHandle) != -1){
			var lastItem = currentProductHandle.split("-").slice(-2).join("-");
		}else{
		  var lastItem = currentProductHandle.split("-").pop();
		}
		//console.log(lastItem);

       var selectProductClassic = currentProductHandle.replaceAll(lastItem, "classic" );
		 jQuery.getJSON(window.Shopify.routes.root + 'products/' + selectProductClassic + '.js', function(product) {
			//console.log(product);
           $('#classic-type').css('visibility','visible');
		  }).fail(function() {
		   $('#classic-type').hide();
		  });

     var selectProductEco = currentProductHandle.replaceAll(lastItem, "eco" );
		 jQuery.getJSON(window.Shopify.routes.root + 'products/' + selectProductEco + '.js', function(product) {
			//console.log(product);
           $('#eco-type').css('visibility','visible');
		  }).fail(function() {
		   $('#eco-type').hide();
		  });

   var selectProductHex = currentProductHandle.replaceAll(lastItem, "hex" );
		 jQuery.getJSON(window.Shopify.routes.root + 'products/' + selectProductHex + '.js', function(product) {
			//console.log(product);
           $('#hex-type').css('visibility','visible');
		  }).fail(function() {
		   $('#hex-type').hide();
		  });
  
   
		 var selectProductXtreme = currentProductHandle.replaceAll(lastItem, "xtreme-3d-car-mat" );
		 jQuery.getJSON(window.Shopify.routes.root + 'products/' + selectProductXtreme + '.js', function(product) {
			//console.log(product);
           $('#xtreme-type').css('visibility','visible');
		  }).fail(function() {
		   $('#xtreme-type').hide();
		  });
	 
		 var selectProductUltimate = currentProductHandle.replaceAll(lastItem, "hex-ultimate" );
		 jQuery.getJSON(window.Shopify.routes.root + 'products/' + selectProductUltimate + '.js', function(product) {
			//console.log(product);
           $('#ultimatehex-type').css('visibility','visible');
		  }).fail(function() {
		   $('#ultimatehex-type').hide();
		  });
   
  });

/** End Check Ultimate Hex & Xtreme Product **/


var $product_img_cell = $(".variant_imgs_cell"), 
    $product_img_cell_array = [],
    $product_slider = $("#productImg").flickity();
	$product_slider.flickity("destroy"),
    $(function() {
        productImgArray(), imageUpdater();
    }),
    (productImgArray = () => {
        $product_img_cell.each(function() {
            var r = $(this);
            $product_img_cell_array = $product_img_cell_array.concat(r);
        });
    }),
    (getSelectedVariantValue = () => {
        var a = "";
        return (
            $(".swatch_alt_val").each(function() {
                var r = $(this);
                r.prop("checked") && ((r = r.val()), (a += r + "-"));
            }),
            (a = a.replace(/-\s*$/, ""))
        );
    }),
    (imageUpdater = (r) => {
        var t = getSelectedVariantValue(),
        a = 0;
		var radioValue = 'Automatic';
        var altArray = t.split('-');
        var newAltArr = altArray.slice(0, -1); 
        newAltArr.splice(1, 0, radioValue);
        var altStr = newAltArr.toString();
        var t = altStr.replace(/,/g, '-');
      
      var currentProductHandle  = $(".product_form").attr("data-product-handle");
    var lastItem = currentProductHandle.split("-").pop();
     
      //console.log(lastItem);
        $product_img_cell.each(function() {
                $(this).remove();
                for (var r = 0; r < $product_img_cell_array.length; r++) {
                    var a = $product_img_cell_array[r].attr("data-title");
                    (t != a && "main_image" != a && "main_image_classic" != a) || $("#productImg .flickity-slider").append($product_img_cell_array[r]);
                }
            });
          if(lastItem == 'classic'){
            $('.swatch-element-type.selected').removeClass('selected');
            (a = r ? 2 : 0);
          }else{
            (a = r ? 1 : 0);
          }
            
            $product_slider.flickity("destroy"),
            $("#productImg").flickity({
                pageDots: !0,
                initialIndex: a
            });
    }),
    (changeSwatch = (r) => {
        $(r);
        setTimeout(function() {
            imageUpdater(!0);
        }, 500);
    }),


  (changeType = (tr) => {
    $('.swatch-element-type.selected').removeClass('selected');
    $(tr).addClass('selected');
    var typeValue = $(tr).attr('data-value'); 
    $("input[value=" + typeValue + "]").attr('checked', 'checked');
    var currentProductHandle  = $(".product_form").attr("data-product-handle");
    var xtremeHandle = "xtreme-3d-car-mat";
	var ultimateHandle = "hex-ultimate";
    if(currentProductHandle.indexOf(xtremeHandle) != -1){
        var lastItem = currentProductHandle.split("-").slice(-4).join("-");
    }else if(currentProductHandle.indexOf(ultimateHandle) != -1){
		var lastItem = currentProductHandle.split("-").slice(-2).join("-");
	}else{
      var lastItem = currentProductHandle.split("-").pop();
    }
    //console.log(lastItem);
    
    if(typeValue == 'Classic'){
      var selectProductType = currentProductHandle.replaceAll(lastItem, "classic");
    }
    else if(typeValue == 'Hex'){
      var selectProductType = currentProductHandle.replaceAll(lastItem, "hex" );
    }
    else if(typeValue == 'Eco'){
      var selectProductType = currentProductHandle.replaceAll(lastItem, "eco" );
    }
    else if(typeValue == 'Ultimate-Hex'){
      var selectProductType = currentProductHandle.replaceAll(lastItem, "hex-ultimate" );
    }
    else if(typeValue == 'Xtreme'){
      var selectProductType = currentProductHandle.replaceAll(lastItem, "xtreme-3d-car-mat" );
    }

    window.location.href = "/products/"+selectProductType;
    
    //window.location.href = "/products/"+selectProductType;
    /*var fullProductUrl = "https://my.trapo.asia/products/"+selectProductType;
    $.get( fullProductUrl, function( data ) {
        console.log(data);   
      //var productHtml = data.find(".shopify-section--product-template").html();
       //console.log(productHtml); 
      $(".shopify-section--product-template").empty();
      //console.log($(data).find(".section-wrapper").html());
      $('.shopify-section--product-template').append($(data).find(".shopify-section--product-template").html());
    });
    /*jQuery.getJSON(window.Shopify.routes.root + 'products/' + selectProductType + '.js', function(product) {
      console.log(product);
      var $productImages = product.media;
      console.log($productImages);
      $productImages.forEach(function(item) {
         console.log(item.src);
      });
  
    });*/
  }),

  (changeImage = (tr) => {
    $(tr).addClass('selected');
    $(tr);
        setTimeout(function() {
            imageUpdaterNew(!0);
        }, 500);
  }),
  (imageUpdaterNew = (tr) => {
        var t = getSelectedVariantValue();
    //console.log(t);
        a = 0;
		var radioValue = 'Automatic';
        var altArray = t.split('-');
        var newAltArr = altArray.slice(0, -1); 
        newAltArr.splice(1, 0, radioValue);
        var altStr = newAltArr.toString();;
        var t = altStr.replace(/,/g, '-');
        $product_img_cell.each(function() {
                $(this).remove();
                for (var tr = 0; tr < $product_img_cell_array.length; tr++) {
                    var a = $product_img_cell_array[tr].attr("data-title");
                    (t != a && "main_image" != a && "main_image_classic" != a) || $("#productImg .flickity-slider").append($product_img_cell_array[tr]);
                }
            }),
            (a = tr ? 1 : 0),
          
            $product_slider.flickity("destroy"),
            $("#productImg").flickity({
                pageDots: !0,
                initialIndex: a
            });
    });


$("#back_btn").click(function (){
  window.history.back();
});


 $(document).ready(function(){
      if(window.matchMedia("(max-width: 767px)").matches){
          $('.product-block--title').prependTo('.product__images');
          $('.product-block--price').appendTo('.product-block--title');
          $('.product-block--text').appendTo('.product-block--price');
      } 
  });

$(window).scroll(function (event) {
    var height = $(window).height();
    var scroll = $(window).scrollTop();
    //console.log(scroll + " " + height);
    if(scroll > height){
     $(".sticky_cart").addClass("show");
    } else {
     $(".sticky_cart").removeClass("show");
    }
});




$(document).ready(function(){
	onload();
	
	//Main Function
	function onload() {
		
		if ($(".modal_price").data('display-campaign')) {
		    var timeonload = setInterval(function() {
				//console.log("onload function calling .....");
				var salePer = $(".modal_price").data('campaign-discount');
				var currentPrice = $('.price .money').text().replace("RM","").replace(",","");
				//console.log(currentPrice);
				clearInterval(timeonload);
				var percentage = currentPrice * salePer / 100;
				var percentage = percentage.toFixed(3);
				var final = currentPrice - percentage;
				var final = final.toFixed(2);
				var final = window.Shopify.formatMoney(final, $('body').data('money-format'));
				
				$(".modal_price").find(".compare-at-price").html($('.price .money').text());
				$(".footer-p-price").find(".was-price").html($('.price .money').text());
				$(".modal_price").find(".price .money").html(final);
				$(".footer-p-price").find(".money").html(final);
				//console.log(final);
			}, 1000);
		}
	}
	
	// Change price on varient selection - Start 
	if ($(".modal_price").data('display-campaign')) {
		$(document).on("click", ".swatch-element", function() {
			setTimeout(function() {
				//onload();
					var salePer = $(".modal_price").data('campaign-discount');
					var currentPrice = $('.price .money').text().replace("RM","").replace(",","");
					//console.log(currentPrice);
					var percentage = currentPrice * salePer / 100;
					var percentage = percentage.toFixed(3);
					var final = currentPrice - percentage;
					var final = final.toFixed(2);
					var final = window.Shopify.formatMoney(final, $('body').data('money-format'));
					$(".modal_price").find(".compare-at-price").html($('.price .money').text());
					$(".footer-p-price").find(".was-price").html($('.price .money').text());
					$(".modal_price").find(".price .money").html(final);
					$(".footer-p-price").find(".money").html(final);
					//console.log(final);
			}, 200);
		});
	}
	// Change price on varient selection - End
	
});

 
 /* Promo Bar */
 
 var slides = document.querySelectorAll('#slides .slide');
var currentSlide = 0;
var slideInterval = setInterval(nextSlide,5000);

function nextSlide(){
  slides[currentSlide].className = 'slide';
  currentSlide = (currentSlide+1)%slides.length;
  slides[currentSlide].className = 'slide showing';
}



/** Start Rear Functionality **/
$(document).ready(function(){
  $(document).on("click", ".rear-btn", function() {
      var selBrand = $("#r-brand option:selected").val();
      var selModel = $("#r-model option:selected").val();
      var selYear = $("#r-year option:selected").val();

      if (selBrand == "" || selModel == "" || selYear == "") {
          //If the "Please Select" option is selected display error.
          alert("Please select an option!");
          return false;
      }

      if(selBrand != '' || selYear != '' || selModel != '' ){
        //console.log(selBrand);
        //console.log(selModel);
        //console.log(selYear);
        var rearProductHandle = selBrand + '-' + selModel + '-' + selYear + '-rear-trapo-classic';
        
        rearProductHandle = rearProductHandle.replace(/[\. ,:-]+/g, "-");
        
          jQuery.getJSON(window.Shopify.routes.root + 'products/' + rearProductHandle.replace(/\s+/g, "-") + '.js', function(product) {
			window.location.href = "/products/"+rearProductHandle.replace(/\s+/g, "-").toLowerCase();
		  }).fail(function() {
		   alert('Product not found!!')
		  });
      }
  });
});


$('#r-brand').on('change', function() {
  $('#r-model').prop('selectedIndex',0);
  $('#r-year').prop('selectedIndex',0);
  $("#r-year option").not(':first').hide();
  $("#r-model span").contents().unwrap();
  $("#r-year option").not(':first').addClass('dn');
  var selBrand = this.value;
  $('#r-model option').each(function(i) {
    if(i > 0){
      var optionBrand = $(this).data("brand");
      if(optionBrand == selBrand){
        $(this).show();
        $(this).removeClass('dn');
      }else{
        $(this).hide();
        $(this).addClass('dn');
      }
    }
  });
  $('.dn').wrap('<span>');
});

$('#r-model').on('change', function() {
  $('#r-year').prop('selectedIndex',0);
  var selModel = this.value;
  var selBrand = $('#r-brand').find(":selected").val();
  $("#r-year span").contents().unwrap();
  $('#r-year option').each(function(i) {
    if(i > 0){
      var optionBrand = $(this).data("brand");
      var optionModel = $(this).data("model");
      if(optionBrand == selBrand && optionModel == selModel ){
        $(this).show();
        $(this).removeClass('dn');
      }else{
        $(this).hide();
        $(this).addClass('dn');
      }
    }
  });
  $('.dn').wrap('<span>');
});

/** End Rear Functionality **/


/** Start Dashcam Filter Functionality **/

$(document).ready(function(){
  $(document).on("click", ".dashcam-btn", function() {
      var selDashModel = $("#dash-model option:selected").val();
  
      if (selDashModel == "" ) {
          //If the "Please Select" option is selected display error.
          alert("Please select an option!");
          return false;
      }

      if(selDashModel != '' ){
      
        var dashProductHandle = selDashModel ;
        //console.log(dashProductHandle);
        if(dashProductHandle == 'trapo-i-sight-t350-dashcam'){
          var variantId = 40156459302989;
        }
        if(dashProductHandle == 'trapo-i-sight-t550-dashcam'){
          var variantId = 40157387849805;
        }
        
          jQuery.getJSON(window.Shopify.routes.root + 'products/' + dashProductHandle.replace(/\s+/g, "-") + '.js', function(product) {
			//window.location.href = "/products/"+rearProductHandle.replace(/\s+/g, "-").toLowerCase();
            var params = {
                  type: 'POST',
                  url: '/cart/add.js',
                  data: {id: variantId,quantity: '1'},
                  dataType: 'json',
                  success: function(line_item) {
                    window.location.href = "/checkout/";
                  },
                };
                $.ajax(params);
		  }).fail(function() {
		   alert('Product not found!!')
		  });
      }
  });
  $(document).on("click", ".scroll-btm-btn", function() {
    $('html, body').animate({
        scrollTop: $("#r-form").offset().top
    }, 50);
  });
});

/** End Dashcam Filter Functionality **/



/** Start Wiper Filter Functionality **/
$(document).ready(function(){
  $(document).on("click", ".wiper-btn", function() {
      var selWiperBrand = $("#w-brand option:selected").val();
      var selWiperModel = $("#w-model option:selected").val();
      var selWiperYear = $("#w-year option:selected").val();

      if (selWiperBrand == "" || selWiperModel == "" || selWiperYear == "") {
          //If the "Please Select" option is selected display error.
          alert("Please select an option!");
          return false;
      }

      if(selWiperBrand != '' || selWiperYear != '' || selWiperModel != '' ){
        //console.log(selWiperBrand);
        //console.log(selWiperModel);
        //console.log(selWiperYear);
        var wiperProductHandle = selWiperBrand + '-' + selWiperModel + '-' + selWiperYear + '-hydrophobic-wiper-blade';
        //console.log(wiperProductHandle);
        wiperProductHandle = wiperProductHandle.replace(/[\. ,:-]+/g, "-");
        
          jQuery.getJSON(window.Shopify.routes.root + 'products/' + wiperProductHandle.replace(/\s+/g, "-") + '.js', function(product) {
            //console.log(product);
			//console.log(product.variants[0].id);
            var params = {
                  type: 'POST',
                  url: '/cart/add.js',
                  data: {id: product.variants[0].id,quantity: '1'},
                  dataType: 'json',
                  success: function(line_item) {
                    window.location.href = "/checkout/";
                  },
                };
                $.ajax(params);
		  }).fail(function() {
		   alert('Product not found!!')
		  });
      }
  });
});


$('#w-brand').on('change', function() {
  $('#w-model').prop('selectedIndex',0);
  $('#w-year').prop('selectedIndex',0);
  $("#w-year option").not(':first').hide();
  $("#w-model span").contents().unwrap();
  $("#w-year option").not(':first').addClass('dn');
  var selWiperBrand = this.value;
  $('#w-model option').each(function(i) {
    if(i > 0){
      var optionBrand = $(this).data("brand");
      if(optionBrand == selWiperBrand){
        $(this).show();
        $(this).removeClass('dn');
      }else{
        $(this).hide();
        $(this).addClass('dn');
      }
    }
  });
  $('.dn').wrap('<span>');
});

$('#w-model').on('change', function() {
  $('#w-year').prop('selectedIndex',0);
  var selWiperModel = this.value;
  var selWiperBrand = $('#w-brand').find(":selected").val();
  $("#w-year span").contents().unwrap();
  $('#w-year option').each(function(i) {
    if(i > 0){
      var optionBrand = $(this).data("brand");
      var optionModel = $(this).data("model");
      if(optionBrand == selWiperBrand && optionModel == selWiperModel ){
        $(this).show();
        $(this).removeClass('dn');
      }else{
        $(this).hide();
        $(this).addClass('dn');
      }
    }
  });
  $('.dn').wrap('<span>');
});

/** End Wiper Filter Functionality **/


/** Start Car Size Functionality **/
$(document).ready(function(){
  $(document).on("click", ".size-btn", function() {
      var selBrand = $("#s-brand option:selected").val();
      var selModel = $("#s-model option:selected").val();
      var selYear = $("#s-year option:selected").val();

      if (selBrand == "" || selModel == "" || selYear == "") {
          //If the "Please Select" option is selected display error.
          alert("Please select an option!");
          return false;
      }

      if(selBrand != '' || selYear != '' || selModel != '' ){
        //console.log(selBrand);
        //console.log(selModel);
        //console.log(selYear);
        var rearProductHandle = selBrand + '-' + selModel + '-' + selYear + '-trapo-classic';
        rearProductHandle = rearProductHandle.replace(/[\. ,:-]+/g, "-").toLowerCase();  
        console.log(rearProductHandle);
          jQuery.getJSON(window.Shopify.routes.root + 'products/' + rearProductHandle.replace(/\s+/g, "-") + '.js', function(product) {
			//window.location.href = "/products/"+rearProductHandle.replace(/\s+/g, "-").toLowerCase();
            //console.log(product.tags);
            $.each(product.tags, function(index, value) {
              //console.log(value);
              var str2 = "size";
              if(value.indexOf(str2) != -1){
                //console.log(value);
                  var carSize = value.replace('size:','');
                  alert(carSize);
              }
              
            });
		  }).fail(function() {
		   alert('Product not found!!')
		  });
      }
  });
});


$('#s-brand').on('change', function() {
  $('#s-model').prop('selectedIndex',0);
  $('#s-year').prop('selectedIndex',0);
  $("#s-year option").not(':first').hide();
  $("#s-model span").contents().unwrap();
  $("#s-year option").not(':first').addClass('dn');
  var selBrand = this.value;
  $('#s-model option').each(function(i) {
    if(i > 0){
      var optionBrand = $(this).data("brand");
      if(optionBrand == selBrand){
        $(this).show();
        $(this).removeClass('dn');
      }else{
        $(this).hide();
        $(this).addClass('dn');
      }
    }
  });
  $('.dn').wrap('<span>');
});

$('#s-model').on('change', function() {
  $('#s-year').prop('selectedIndex',0);
  var selModel = this.value;
  var selBrand = $('#s-brand').find(":selected").val();
  $("#s-year span").contents().unwrap();
  $('#s-year option').each(function(i) {
    if(i > 0){
      var optionBrand = $(this).data("brand");
      var optionModel = $(this).data("model");
      if(optionBrand == selBrand && optionModel == selModel ){
        $(this).show();
        $(this).removeClass('dn');
      }else{
        $(this).hide();
        $(this).addClass('dn');
      }
    }
  });
  $('.dn').wrap('<span>');
});

$("#s-brand option").each(function() {
  $(this).siblings('[value="'+ this.value +'"]').remove();
});
$("#s-model option").each(function() {
  $(this).siblings('[value="'+ this.value +'"]').remove();
});
$("#s-year option").each(function() {
  $(this).siblings('[value="'+ this.value +'"]').remove();
});

$(".search-submit").click(function() {
        $(".search_form").submit();
    });

/** End Car Size Functionality **/


jQuery(document).ready(function() {
        // Toggle modal visibility
        jQuery('.modal-toggle').on('click', function(e) {
            e.preventDefault();
            jQuery('.offer-modal').toggleClass('is-visible');
            jQuery('body').toggleClass('modal-open');
        });

        // Close modal when clicking on the close button
        jQuery('.close').on('click', function() {
            jQuery('.offer-modal').removeClass('is-visible');
            jQuery('body').removeClass('modal-open');
        });

        // Close modal when clicking outside of it
        jQuery(document).on('click', function(e) {
            if (jQuery('.offer-modal').hasClass('is-visible') && !jQuery(e.target).closest('.offer-modal').length && !jQuery(e.target).closest('.modal-toggle').length) {
                jQuery('.offer-modal').removeClass('is-visible');
                jQuery('body').removeClass('modal-open');
            }
        });
  $(" .dropdown_toggle").on("click", function() {
        $(this)
            .parent("  .submenu_item")
            .children(" .submenu_list ")
            .stop()
            .slideToggle();
    });
    });


