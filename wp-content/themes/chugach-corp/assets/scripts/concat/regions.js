(function (document, window, $) {

	'use strict';
    
    $('.page-template-regions #map-box img').on( 'click', function(e) {
        var offset = $(this).offset();
        var x = Math.floor((e.pageX - offset.left) / $(this).width() * 10000)/100;
        var y = Math.floor((e.pageY - offset.top) / $(this).height() * 10000)/100;
        
        $('#mouse-xy').val( x + '/' + y );     
    });
    
    $( ".map-key button" ).hover(
      function() {
        $('#map-box button').removeClass( "hover" );
        var id = $(this).data('marker');
        $(id).addClass('hover');
      }, function() {
        $('#map-box button').removeClass( "hover" );
      }
    );
    
    $('.page-template-regions #map-box button').on( 'click', function(e) {
        //$(this).addClass('hover');
    });
    
    
    $('.page-template-regions .map-key button').on( 'click', function(e) {
        var id = $(this).data('marker');
        //$(id).addClass('hover');
    });
    
    
    $(window).load(function() {
        $('.page-template-regions #map-box .locations').css('opacity', 1);
    });
    
}(document, window, jQuery));



