(function($) {
    $(document).on('facetwp-loaded', function() {
        if (FWP.loaded) {
            var target = $('.facetwp-template');
            var offset = -150;
            
            if( $('.facetwp-filters').length ) {
                var target = $('.facetwp-filters');
            } else if( $('.facetwp-custom-filters').length ) {
                var target = $('.facetwp-custom-filters');
                offset = -60;
            }
                                    
            $.smoothScroll({
                scrollTarget: target,
                offset: offset
            });
            
            $('#book-filters').foundation('close');
            
            Foundation.reInit('equalizer');
        }
        
    });
    
    
})(jQuery);