(function (document, window, $) {

	'use strict';

	// Load Foundation
	$(document).foundation();
    
    $('body').addClass('document-ready');
   
    $('.scroll-next').on('click',function(e){
        
        $.smoothScroll({
            offset: -100,
            scrollTarget: $('main section:first-child'),
        });
    });
    
    // Toggle menu
    
    $('li.menu-item-has-children > a[href^="#"]').on('click',function(e){
        
        var $toggle = $(this).parent().find('.sub-menu-toggle');
        
        if( $toggle.is(':visible') ) {
            $toggle.trigger('click');
            e.preventDefault();
        }
        
        

    });
    
  
    $(window).scroll(animateNumbers);
    
    $(window).on("load scroll",function(e){
        animateNumbers(); 
    });
    var viewed = false;
    
    function isScrolledIntoView(elem) {
        
        if( ! $(elem).length ) {
            return false;
        }
        
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
    
        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();
    
        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }
    
    function animateNumbers() {
      if (isScrolledIntoView($(".numbers")) && !viewed) {
          viewed = true;
          $('.number').each(function () {
          $(this).css('opacity', 1);
          $(this).prop('Counter',0).animate({
              Counter: $(this).text().replace(/,/g, '')
          }, {
              duration: 4000,
              easing: 'swing',
              step: function (now) {
                  $(this).text(Math.ceil(now).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
              }
          });
        });
      }
    }

    $('.ul-expand').each(function () {
        if($(this).find('li:visible').length) {
            $(this).find('span a').show();
        }
    });
    
    $('.ul-expand').on('click','span a',function(e){
        e.preventDefault();
        //var $children = $(this).prev('ul').children();
        
        //$children.css('display', 'inline');
        //return false;
        $(this).parents('div').find('ul').removeClass('short');
        $(this).remove();  
    });

    
    
}(document, window, jQuery));
