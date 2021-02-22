(function (document, window, $) {

	'use strict';

    /**
     * Pagebuilder Image Library
     */
    let $pagebuilder_image_library = jQuery('.pagebuilder-section-image-library');
    if($pagebuilder_image_library) {
      $pagebuilder_image_library.each(function() {

        var $this = jQuery(this);

        /**
         * Set up the slider stuff
         */
        var $autoplay = false;
        var $autoplaySpeed = 6000;
        if($this.attr('data-autoplay')) {
          $autoplay = true;
          if($this.attr('data-autoplay-speed')) {
            $autoplaySpeed = $this.attr('data-autoplay-speed');
          }
        }
        if ( $('.slick', $this).length ) {

          $this.find('.slick').slick({
            dots: false,
            arrows: true,
            infinite: true,
            speed: 300,
            draggable: true,
            lazyLoad: 'ondemand',
            autoplay: $autoplay,
            autoplaySpeed: $autoplaySpeed,
            slidesToShow: 3,
            slidesToScroll: 1,
            centerMode: true,
            centerPadding: '0px',
            prevArrow: $this.find('.slick-prev'),
            nextArrow: $this.find('.slick-next'),
          });

          /**
           * Set the heights of all the captions
           */
          var $captions = $this.find('.image-caption');
          if($captions) {
            $captions.each(function() {
              var $caption = $(this);
              var $captionHeight = $caption.height();
              // console.log($captionHeight);
              $caption.css('margin-bottom',($captionHeight * -1) + 'px');
            });
          }

          /* On resize (throttled) */
          window.addEventListener('resize', imageLibraryCaptionResizer, false);

          var timer = null;
          function imageLibraryCaptionResizer() {
            timer = timer || setTimeout(function() {
                timer = null;
                if($captions) {
                  $captions.each(function() {
                    var $caption = $(this);
                    var $captionHeight = $caption.height();
                    console.log($captionHeight);
                    $caption.css('margin-bottom',($captionHeight * -1) + 'px');
                  });
                }
            }, 50);
          }

          $this.imagesLoaded()
          .done( function( instance ) {
            $this.addClass('images-loaded');
          });
        }
        jQuery(this).lightGallery({
          selector: '.slick-slide:not(.slick-cloned) .image-modal-link',
          thumbnail: false,
        });
      });
    }

    /**
     * Pagebuilder Full-width image carousel
     */
    let $pagebuilder_full_width_image_carousel = $('.pagebuilder-section-full-width-image-carousel');
    if($pagebuilder_full_width_image_carousel) {
      $pagebuilder_full_width_image_carousel.each(function() {
        var $this = $(this);
        var $autoplay = false;
        var $autoplaySpeed = 6000;
        if($this.attr('data-autoplay')) {
          $autoplay = true;
          if($this.attr('data-autoplay-speed')) {
            $autoplaySpeed = $this.attr('data-autoplay-speed');
          }
        }
        console.log('autoplay status: ' + $autoplay + ', autoplay speed: ' + $autoplaySpeed);
        if ( $('.slick', $this).length ) {

          $this.find('.slick').slick({
            dots: false,
            arrows: true,
            infinite: true,
            speed: 300,
            autoplay: $autoplay,
            autoplaySpeed: $autoplaySpeed,
            lazyLoad: 'ondemand',
            slidesToShow: 1,
            slidesToScroll: 1,
            prevArrow: $this.find('.slick-prev'),
            nextArrow: $this.find('.slick-next'),
          });

          $this.imagesLoaded()
          .done( function( instance ) {
            $this.addClass('images-loaded');
          });
        }
      });
    }

    /**
     * Pagebuilder steps
     */
    let $pagebuilder_steps = $('.pagebuilder-section-steps');
    if($pagebuilder_steps) {
      $pagebuilder_steps.each(function() {
        var $this = $(this);
        var $autoplay = false;
        var $autoplaySpeed = 6000;
        if($this.attr('data-autoplay')) {
          $autoplay = true;
          if($this.attr('data-autoplay-speed')) {
            $autoplaySpeed = $this.attr('data-autoplay-speed');
          }
        }
        if ( $('.slick', $this).length ) {

          $this.find('.slick').slick({
            dots: false,
            arrows: true,
            infinite: false,
            speed: 300,
            autoplay: $autoplay,
            autoplaySpeed: $autoplaySpeed,
            slidesToShow: 4,
            slidesToScroll: 1,
            prevArrow: $this.find('.slick-prev'),
            nextArrow: $this.find('.slick-next'),
            responsive: [
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 3,
                }
              },
              {
                breakpoint: 750,
                settings: {
                  slidesToShow: 2,
                }
              },
              {
                breakpoint: 550,
                settings: {
                  slidesToShow: 1,
                }
              }
            ]
          });
        }
      });
    }


}(document, window, jQuery));
