(function (document, window, $) {

	'use strict';

    $(".lazy").recliner({
        attrib: "data-src", // selector for attribute containing the media src
        throttle: 300,      // millisecond interval at which to process events
        threshold: 100,     // scroll distance from element before its loaded
        printable: true,    // be printer friendly and show all elements on document print
        live: true          // auto bind lazy loading to ajax loaded elements
    });
    
    $(document).on('lazyload', '.lazy', function() {
        var $e = $(this);
        // do something with the element to be loaded...
        // console.log('lazyload', $e);
    });
    
}(document, window, jQuery));
