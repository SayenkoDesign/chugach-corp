(function (document, window, $) {

	'use strict';

    var $html = $('html');
    const $on_page_links = $('#on-page-links');
    const $links_container  = $('.on-page-links-container');
    const $menu_button  = $('.on-page-mobile-nav-toggle');
    var $menu_width = $('.on-page-links-list').width();

    $on_page_links.addClass('init');

    // console.log('init mobile nav');

    // check if it should force to hamburger
    function on_page_links_mobile_display() {
        var $links_container_width = $links_container.width();
        // var $menu_width   = $('.on-page-links-list').width();

        var $items_width  = $menu_width + 40;
        var $display_menu = $items_width >= $links_container_width;

        return $display_menu;
    }

    // adds/removes classes based on screen width
    function on_page_links_mobile_classes() {

        var $display_menu = on_page_links_mobile_display();

        if(!$display_menu) {
            $on_page_links.removeClass('on-page-mobile-nav-active');
            $on_page_links.removeClass('on-page-mobile-nav-display');
            // console.log('begone classes');
        }
        else if (!$on_page_links.hasClass('on-page-mobile-nav-display')) {
            $on_page_links.addClass('on-page-mobile-nav-display');
            // console.log('right_size_for_mobile_nav');
        }
    }

    function mobileNav_activate() {
        $on_page_links.addClass('on-page-mobile-nav-active');
    }

    function mobileNav_deactivate() {
        $on_page_links.removeClass('on-page-mobile-nav-active');
    }

    function mobileNav_toggle() {

        if($on_page_links.hasClass('on-page-mobile-nav-active')) {
            mobileNav_deactivate();
            $menu_button.html('Menu');
        }
        else {
            mobileNav_activate();
            $menu_button.html('Close');
        }
    }



    // add proper class on document load
    $(document).ready(function() {
        on_page_links_mobile_classes();
    });

    // do it again when *everything* is loaded
    $(window).bind('load', function() {
        on_page_links_mobile_classes();
    });

    // adjust display classes on resize
    // SHOULD THROTTLE THIS THING
    $(window).resize(function() {

    });


    /* On resize (throttled) */
    window.addEventListener('resize', on_page_links_resizer, false);

    var timer = null;
    function on_page_links_resizer() {

        timer = timer || setTimeout(function() {
            timer = null;
            on_page_links_mobile_classes();
        }, 50);
    }



    // on clicking .on-page-mobile-nav-open
    /**
     * WooCommerce was giving me issues with doubleclicking
     *   - Had to add a class to body to cancel out a double-clicked thing
     */
    $menu_button.click(function(e) {
        e.preventDefault();

        mobileNav_toggle();
    });

    // if open, close on pressing escape key
    // $(document).on('keydown',function(e) {
    //     if (e.keyCode === 27 && $('html').hasClass('on-page-mobile-nav-active')) { // ESC
    //         $('html').removeClass('on-page-mobile-nav-active');
    //     }
    // });

}(document, window, jQuery));

