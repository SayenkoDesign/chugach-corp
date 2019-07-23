(function (document, window, $) {

	'use strict';

	var $lg = $("#light-gallery");
	$lg.lightGallery({
		selector: '.column',
		thumbnail:true,
		download: false
	}); 

	$('[name="gallery_cat"]').on( 'change', function(){
		var href = $( '[name="gallery_cat"] option:selected' ).data('href');
		var page_id = $('#light-gallery').data('page-id');
		var limit = $('#light-gallery').data('limit');

		$('#light-gallery').addClass('lg-loading');
		$('[name="gallery_cat"]').addClass('lg-category-loading');

		$lg.data('lightGallery').destroy(true);
		$.ajax({
			type: "POST",
			url: href, 
			data: {
				action: 'light_gallery', 
				lg_page_id: page_id, 
				lg_gallery_cat: $('[name="gallery_cat"]').val(), 
				lg_limit: limit
			},
			success: function(data){
				var output = $.parseJSON( data );

				var gallery = $(output.html);
				var category = $(output.category);
				var pagination = $(output.pagination);

				$('#light-gallery').html( gallery.html() );
				$('[name="gallery_cat"]').html( category.html() );
				
				if( pagination.length ){
				    $('.gallery-pagination').html( pagination );
				}else{
				    $('.gallery-pagination').empty();
				}

				$lg.lightGallery({
					selector: '.column',
					thumbnail:true,
					download: false
				});
                
                $('#light-gallery').imagesLoaded()
                .always( function( instance ) {
                    console.log('all images loaded');
                })
                .done( function( instance ) {
                    $('#light-gallery').removeClass('lg-loading');
                })
                .fail( function() {
                    console.log('all images loaded, at least one is broken');
                })
                .progress( function( instance, image ) {
                    var result = image.isLoaded ? 'loaded' : 'broken';
                    console.log( 'image is ' + result + ' for ' + image.img.src );
                });


				$('[name="gallery_cat"]').removeClass('lg-category-loading');
			}
		});
	} );

	$(document).on( 'click', '.gallery-pagination a', function(e) {
		e.preventDefault();
		var href = $(this).data('href');
		var page = $(this).data('page');
		var page_id = $('#light-gallery').data('page-id');
		var limit = $('#light-gallery').data('limit');

		$('#light-gallery').addClass('lg-loading');
		$('.gallery-pagination').addClass('lg-pagination-loading');

		$lg.data('lightGallery').destroy(true);
		$.ajax({
			type: "POST",
			url: href, 
			data: {
				action: 'light_gallery', 
				lg_page_id: page_id, 
				lg_page: page, 
				lg_gallery_cat: $('[name="gallery_cat"]').val(), 
				lg_limit: limit
			},
			success: function(data){
				var output = $.parseJSON( data );

				var gallery = $(output.html);
				var category = $(output.category);
				var pagination = $(output.pagination);

				$('#light-gallery').html( gallery.html() );
				$('[name="gallery_cat"]').html( category.html() );
				
				if( pagination.length ){
				    $('.gallery-pagination').html( pagination );
				}else{
				    $('.gallery-pagination').empty();
				}

				$lg.lightGallery({
					selector: '.column',
					thumbnail:true,
					download: false
				});
                
                $('#light-gallery').imagesLoaded()
                .always( function( instance ) {
                    console.log('all images loaded');
                })
                .done( function( instance ) {
                    $('#light-gallery').removeClass('lg-loading');
                })
                .fail( function() {
                    console.log('all images loaded, at least one is broken');
                })
                .progress( function( instance, image ) {
                    var result = image.isLoaded ? 'loaded' : 'broken';
                    console.log( 'image is ' + result + ' for ' + image.img.src );
                });


				$('.gallery-pagination').removeClass('lg-pagination-loading');
			}
		});
	} );

}(document, window, jQuery));