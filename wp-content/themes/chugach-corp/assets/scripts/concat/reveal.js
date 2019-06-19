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
        
    
}(document, window, jQuery));



