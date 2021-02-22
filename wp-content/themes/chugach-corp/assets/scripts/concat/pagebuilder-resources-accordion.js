(function (document, window, $) {

	'use strict';

    var $resources_accordion_links = $('.resources-accordion-title');
    const $trigger_width = 550;
    var $window_width = $(window).width();

    function resourcesAccordionsInitClose() {

        console.log('window: ' + $window_width + ', trigger: ' + $trigger_width);

        var $is_mobile = false;
        if($window_width < $trigger_width) {
            $is_mobile = true;
        }

        $resources_accordion_links.each(function() {
            var $this = $(this);
            if($is_mobile && $this.parent().hasClass('is-active')) {
                $this.trigger('click');
            }
        });
    }

    function resourcesAccordionResizeClose() {

        $window_width = $(window).width();
        console.log('window: ' + $window_width + ', trigger: ' + $trigger_width);

        var $is_mobile = false;
        if($window_width < $trigger_width) {
            $is_mobile = true;
        }

        $resources_accordion_links.each(function() {
            var $this = $(this);
            if(!$is_mobile && !$this.parent().hasClass('is-active')) {
                $this.trigger('click');
            }
        });
    }

    // add proper class on document load
    $(document).ready(function() {
        resourcesAccordionsInitClose();
    });

    // do it again when *everything* is loaded
    $(window).bind('load', function() {
        resourcesAccordionsInitClose();
    });

    /* On resize (throttled) */
    window.addEventListener('resize', resourcesAccordionsResizer, false);

    var timer = null;
    function resourcesAccordionsResizer() {

        timer = timer || setTimeout(function() {
            timer = null;
            resourcesAccordionResizeClose();
        }, 100);
    }

}(document, window, jQuery));
