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
    
    $('li.menu-item-has-children > a').on('click',function(e){
        
        var $toggle = $(this).parent().find('.sub-menu-toggle');
        
        if( $toggle.is(':visible') ) {
            $toggle.trigger('click');
            e.preventDefault();
        }
        
        

    });
  
    
    $('.animate-numbers span').each(function () {
        $(this).prop('Counter',0).animate({
            Counter: $(this).text()
        }, {
            duration: 4000,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
            }
        });
    });
    
    

    $('.ul-expand').each(function () {
        if($(this).find('li:visible').length) {
            $(this).find('span a').show();
        }
    });
    
    $('.ul-expand').on('click','span a',function(e){
        e.preventDefault();
        var $children = $(this).prev('ul').children();
        $(this).remove();  
        $children.show();
        return false;
    });

    
    
}(document, window, jQuery));
