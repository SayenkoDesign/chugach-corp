(function (document, window, $) {

	'use strict';    
    
    $( '<div class="slick-arrows"></div>' ).insertAfter( '.section-videos .slick' );
    
    $('.section-videos .slick').slick({
      dots: false,
      infinite: true,
      speed: 300,
      slidesToShow: 2,
      slidesToScroll: 2,
      appendArrows: $('.section-videos .slick-arrows'),
      responsive: [
        {
          breakpoint: 979,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    });  
    
    $( '<div class="slick-arrows"></div>' ).insertAfter( '.section-stories .slick' );
    
    $('.section-stories .slick').slick({
      dots: false,
      infinite: true,
      speed: 300,
      slidesToShow: 1,
      slidesToScroll: 1,
      appendArrows: $('.section-stories .slick-arrows')
    });
    
}(document, window, jQuery));