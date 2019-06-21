// Reveal
(function (document, window, $) {

	'use strict';
    
    $(document).on('click', '.page-template-regions button[data-region]', loadRegion);
    
    function loadRegion() {
        var $this = $(this);
        var $region = $('#' + $this.data('region') );
        var $modal = $('#' + $this.data('open'));
        
        if( $region.size() ) {
          $('.container', $modal ).html($region.html()); 
        }
    }

    
    $(document).on('closed.zf.reveal', '#regions', function () {
        $(this).find('.container').empty();
        // remove action button class
        $('#map-box button').removeClass( "hover" );
    });
    
    
    $(document).on('click', '.template-business-lines button[data-content]', loadMap);
    
    function loadMap() {
        var $this = $(this);
        var $map = $('#' + $this.data('content') );
        var $modal = $('#' + $this.data('open'));
        
        if( $map.size() ) {
          $('.container', $modal ).html($map.html()); 
        }
    }

    
    $(document).on('closed.zf.reveal', '#maps', function () {
        $(this).find('.container').empty();
        $('.map').stop().removeClass('active').css({'opacity':'0'});
        $('#map-0').stop().css({'opacity':'1'});
    });
        
    
}(document, window, jQuery));



