(function (document, window, $) {

    'use strict';
    
    $('.careers-section .column h3').matchHeight({ row: true });

    var searchParams = new URLSearchParams(window.location.search);
    if(searchParams.has('search')) {
        var param = searchParams.get('search');
        if(param === 'true') {
        $("html, body").animate({ scrollTop: $('#careers-root').offset().top -35 }, 1000);
            $("main section:not('.careers-section')").fadeOut();
        }
        
        $('.careers-section .column h3').matchHeight({ row: true });
    }

}(document, window, jQuery));