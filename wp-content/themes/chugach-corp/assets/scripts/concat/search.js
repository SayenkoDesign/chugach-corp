(function (document, window, $) {

	'use strict';

	$(document).on(
      'open.zf.reveal', '#modal-search', function () {
        $(this).find("input").first().focus();
      }
    );
    
}(document, window, jQuery));