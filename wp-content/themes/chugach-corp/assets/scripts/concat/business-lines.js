(function($) {
	
	'use strict';	
	
	var $legend = $( '.section-business-lines-map .legend' );
    
    var $maps = $( '.section-business-lines-map .maps' );
    
    $(window).load(function() {
        $maps.animate({'opacity':'1'},500);
    });
        
    //close card when click on cross
    $legend.on('hover','button', function() {
      var id = $(this).data('map');
      console.log(id);
      //$('.map').removeClass('active');
      //$(id).addClass('active');
        if($(id).css('opacity') == 0) {
            $('.map').stop().not(id).animate({'opacity':'0'},250);
            $(id).stop().animate({'opacity':'1'},250);
        }
     
    });
    
    $legend.mouseleave(function() {
        $('.map').stop().animate({'opacity':'0'},250);
        $('#map-0').stop().animate({'opacity':'1'},250);
    });

})(jQuery);