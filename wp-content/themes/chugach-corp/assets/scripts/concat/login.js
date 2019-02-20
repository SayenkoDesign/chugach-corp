(function (document, window, $) {

	'use strict';
    
    $('#loginform :input, #passwordform :input').each(function () {
        var label = $(this).parent().find('label').text();
        $(this).attr( 'placeholder', label );
    });
    
}(document, window, jQuery));

