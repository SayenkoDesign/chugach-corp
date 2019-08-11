(function (document, window, $) {

    'use strict';
    
    if($('.page-template-careers').length) {
        var searchParams = new URLSearchParams(window.location.search);
        if(searchParams.has('search')) {
            var param = searchParams.get('search');
            if(param === 'true') {
            $("html, body").animate({ scrollTop: $('#careers-root').offset().top -35 }, 1000);
                $("main section:not('.careers-section')").fadeOut();
            }
    
        }
    
        window.reactMatchHeight = function(elClassName) {
          $('.careers-section .column h3').matchHeight({ row: true });
        }
    }

}(document, window, jQuery));