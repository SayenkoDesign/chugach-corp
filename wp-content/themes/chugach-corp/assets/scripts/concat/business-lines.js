(function($) {
	
	'use strict';	
	
	var $legend = $( '.section-business-lines-map .legend' );
    
    var $maps = $( '.section-business-lines-map .maps' );
    
    $(window).load(function() {
        $maps.animate({'opacity':'1'},500);
    });
        
    //close card when click on cross
    $legend.on('hover','button', function() {
        
        if($('body').hasClass('is-reveal-open')) {
            return;
        }
        
        var id = $(this).data('map');
        if($(id).css('opacity') == 0) {
            $('.map').stop().removeClass('active').not(id).animate({'opacity':'0'},250);
            $(id).stop().animate({'opacity':'1'},250);
        }
     
    });
    
    $legend.on('click','button', function() {
        $('.map').stop().removeClass('active')
        var id = $(this).data('map');
        if($(id).css('opacity') == 0) {
            $('.map').stop().not(id).css({'opacity':'0'});
            $(id).stop().css({'opacity':'1'});            
        } 
        
        $(id).addClass('active');   
     
    });
    
    $legend.mouseleave(function() {
        
        if($('body').hasClass('is-reveal-open')) {
            return;
        }
        
        $('.map').stop().removeClass('active').animate({'opacity':'0'},250);
        $('#map-0').stop().animate({'opacity':'1'},250);
    });

})(jQuery);