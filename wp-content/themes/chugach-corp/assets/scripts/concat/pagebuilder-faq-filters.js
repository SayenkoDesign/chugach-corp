(function (document, window, $) {

	'use strict';

    var $filterButtons = $('.faq-filter-button');

    $('.faq-filter-button').click(function() {
        var filterValue = $(this).attr('data-filter');

        var $allFaqs = $('.faq');

        var $newActiveFaqs = '';
        var $newDeactivatedFaqs = '';
        if(filterValue == '*') {
            $newActiveFaqs = $('.faq');
        }
        else {
            $newActiveFaqs = $(filterValue);
            $newDeactivatedFaqs = $('.faq').not(filterValue);
            console.log($newDeactivatedFaqs);
        }

        /**
         * Close open accordions
         *  - if new filter doesn't have them
         */
        if($newDeactivatedFaqs) {
            $newDeactivatedFaqs.each(function() {
                var $this = $(this);
                if($this.hasClass('is-active')) {
                    $this.find('.accordion-title').trigger('click');
                }
            });
        }

        $allFaqs.each(function() {
            $(this).hide();
            $(this).addClass('faq-hidden');
            $(this).removeClass('faq-shown');
        });
        $newActiveFaqs.each(function() {
            $(this).show();
            $(this).addClass('faq-shown');
            $(this).removeClass('faq-hidden');
        });

        $filterButtons.each(function() {
            $(this).removeClass('active');
        });
        $(this).addClass('active');

    });

}(document, window, jQuery));
