(function (document, window, $) {

	'use strict';    
    
    
    
    let $section_videos = $('.section-videos');
    if ( $('.slick', $section_videos).length ) {
                
        $( '<div class="slick-arrows"></div>' ).insertAfter( '.section-videos .slick' );
        
        $('.section-videos').imagesLoaded( {background: '.background'})
        
        .done( function( instance ) {
    
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
                
            $section_videos.addClass('images-loaded');
        
         });
    }
    
    let $section_stories = $('.section-stories');
    if ( $('.slick', $section_stories).length ) {
                
        $('.section-stories').imagesLoaded({background: 'a'})
        
        .done( function( instance ) {
    
            $( '<div class="slick-arrows"></div>' ).insertAfter( '.section-stories .slick' );
        
            $('.section-stories .slick').slick({
              dots: false,
              infinite: true,
              speed: 300,
              slidesToShow: 1,
              slidesToScroll: 1,
              appendArrows: $('.section-stories .slick-arrows')
            });
                
            $section_stories.addClass('images-loaded');
        
         });
    }
    
    
    $( '<div class="slick-arrows"></div>' ).insertAfter( '.section-core-behaviors .slick' );
    
    $('.section-core-behaviors .slick').slick({
        fade: true,
        dots: true,
        infinite: true,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: false,
        appendArrows: $('.section-core-behaviors .slick-arrows')
    });
    
    $('.section-core-behaviors .grid').on('click','.grid-item', function(e){
        e.preventDefault();
        var slideIndex = $(this).parent().index();
        $( '.section-core-behaviors .slick' ).slick( 'slickGoTo', parseInt(slideIndex) );
    });
    
    
    // Related Posts
    
let $section_related_posts = $('.section-related-posts');
    if ( $('.slick', $section_related_posts).length ) {
                
        $( '<div class="slick-arrows"></div>' ).insertAfter( '.section-related-posts .slick' );
        
        $('.section-related-posts').imagesLoaded( {background: '.post-hero'})
        
        .done( function( instance ) {
    
            $( '<div class="column row slick-arrows"></div>' ).insertAfter( '.section-related-posts .slick' );
    
            $('.section-related-posts .slick').slick({
              dots: false,
              infinite: true,
              speed: 300,
              slidesToShow: 4,
              slidesToScroll: 1,
              appendArrows: $('.section-related-posts .slick-arrows'),
              responsive: [
                {
                  breakpoint: 1200,
                  settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                  }
                },
                {
                  breakpoint: 980,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                  }
                },
                {
                  breakpoint: 480,
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
                
            $section_related_posts.addClass('images-loaded');
        
         });
    }
    
    
    let $section_testimonials = $('.section-testimonials');
    if ( $('.slick', $section_testimonials).length ) {
                
        $( '<div class="slick-arrows"></div>' ).insertAfter( '.section-testimonials .slick' );
        
        $('.section-testimonials').imagesLoaded()
        
        .done( function( instance ) {
    
            $( '<div class="slick-arrows"></div>' ).insertAfter( '.section-testimonials .slick' );
            $('.section-testimonials .slick').slick({
              dots: false,
              arrows: true,
              infinite: true,
              speed: 300,
              slidesToShow: 1,
              slidesToScroll: 1,
              appendArrows: $('.section-testimonials .slick-arrows'),
            });
                
            $section_testimonials.addClass('images-loaded');
        
         });
    }
    
}(document, window, jQuery));