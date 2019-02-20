(function (document, window, $) {

	'use strict';      
    
    $('.logos .slick').slick({
      dots: false,
      infinite: true,
      speed: 300,
      slidesToShow: 4,
      slidesToScroll: 1,
      appendArrows: '.logos .slick-arrows',
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            infinite: true,
            dots: false
          }
        },
        {
          breakpoint: 980,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 640,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
        // You can unslick at a given breakpoint now by adding:
        // settings: "unslick"
        // instead of a settings object
      ]
    });
    
    
        
        
    $('.section-why .navigation').appendTo( '.section-why .inner > .wrap' );

    $('.section-why .panels .slick').on('init', function(event, slick){
                      
       var $items = slick.$dots.find('li');
       //$items.css('left', );
       var $slides = slick.$slides;
       $.each( $slides, function( index, element ){
           var h4 = $(element).find('h4').text();
           var count = index + 1 + '. ';
           $items.eq(index).prepend('<h5>' + count + h4 + '</h5>');
       });
       
    });
            
    $('.section-why .panels .slick').slick({
        dots: true,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        dotsClass: 'no-bullet',
        appendDots: $('.section-why .navigation'),
        appendArrows: '.section-why .slick-arrows',
        asNavFor: '.section-why .background-slick',
        fade: true,
        customPaging: function(slick,index) {
            return '';
        }
    });
    
    
    $('.section-why .background-slick').slick({
        dots: false,
        arrows: false,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: true
    });
    
      
            
    $('.section-search .slick').slick({
        dots: false,
        arrows: false,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1
    });
    
    $('.section-search .slick-nav').slick({
        dots: false,
        arrows: false,
        centerMode: true,
        focusOnSelect: true,
        infinite: true,
        slidesToShow: 3,
        //variableWidth: true,
        centerPadding: '0px',
        asNavFor: '.section-search .slick',
    });
    
    
    
    // timeline Slider
    $('.timeline-slider .slick').on('init', function(event, slick){
              
       var $items = slick.$dots.find('li');
       //$items.css('left', );
       var $slides = slick.$slides;
       $.each( $slides, function( index, element ){
           var position = $(element).find('.event').data('position');
           var year = $(element).find('.event').data('year');
           $items.eq(index).css('left', position);
           $items.eq(index).addClass('year-' + year); 
       });
    });
    
    $('.timeline-slider .slick').on('breakpoint', function(event, slick){
              
       var $items = slick.$dots.find('li');
       //$items.css('left', );
       var $slides = slick.$slides;
       $.each( $slides, function( index, element ){
           var position = $(element).find('.event').data('position');
           var year = $(element).find('.event').data('year');
           $items.eq(index).css('left', position);
           $items.eq(index).addClass('year-' + year); 
       });
    });

	$('.timeline-slider .slick').slick({
        dots: true,
        dotsClass: 'dot-cnt',
        appendDots: $('.timeline-cnt'),
        appendArrows: '.timeline-slider .slick-arrows',
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        customPaging: function(slick,index) {
            return '<div class="blue-dot slidelink' + index + '"></div>';
        },
        responsive: [
        {
            breakpoint: 1200,
            settings: {
                slidesToShow: 3
            }
        },
        {
            breakpoint: 992,
            settings: {
                slidesToShow: 2
            }
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 1
            }
        }
        ]
    
    });

    
    $(window).on('resize', function() {
      //$('.timeline-slider').slick('reinit');
    });
    
}(document, window, jQuery));


