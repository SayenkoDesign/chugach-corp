(function (document, window, $) {

    'use strict';

	var $stickyHeader = $(".sticky-header .site-header");
	var $stickyNav = $(".sticky-nav");
	var $body = $('body');
	var $wpAdminBar = 0;
	var height = 0;
    
	var showNotificationBar = Cookies.get('show-notification-bar');
        
	$(window).on("load", function(){

		console.log(showNotificationBar);
		
		if( 'no' === showNotificationBar) {
			return;
		}
		
		var $notificationBar = $('.section-notification-bar');        
		
		$notificationBar.removeClass('hide');
		
		height = $notificationBar.actual('height') + $wpAdminBar;
		
		setTimeout(function(){  
			if (Foundation.MediaQuery.atLeast('xlarge')) {
				$body.css( 'margin-top', height );
			} else {
				$body.css( 'margin-top', '0' );
				$body.removeAttr( 'style' );
			} 
							
		}, 3000);     
	
	});  
	
	
	$(window).on("resize", function(){
					
		var $notificationBar = $('.section-notification-bar');  
					
		height = $notificationBar.height() + $wpAdminBar;
		
		if (Foundation.MediaQuery.atLeast('xlarge')) {
			$body.css( 'margin-top', height );
		} else {
			$body.removeAttr( 'style' );
		}            
	
	});  
	
	
	$(window).on("scroll", function(){
		
		var hasNotificationBar = true;
		var $notificationBar = $('.section-notification-bar');
		
		if( ! $notificationBar.length && $notificationBar.not(":visible") ) {
			$body.removeAttr( 'style' );
			$stickyHeader.removeAttr( 'style' );
			$stickyNav.removeAttr( 'style' );
			hasNotificationBar = false;
			//return;
		}
											
				
		if( $(window).scrollTop() >= height ){
			$stickyHeader.addClass("fixed");
			$stickyNav.addClass("fixed");
			$body.removeAttr( 'style' );
			$notificationBar.addClass('hide');
		} else {
			$stickyHeader.removeClass("fixed");
			$stickyNav.removeClass("fixed");
			$notificationBar.removeClass('hide');
			if (hasNotificationBar && Foundation.MediaQuery.atLeast('xlarge')) {
				$body.css( 'margin-top', height );
			} else {
				$body.removeAttr( 'style' );
			} 
		}
	});
	
	$(document).on('close.zf.trigger', '.section-notification-bar[data-closable]', function(e) {
		$body.css( 'margin-top', 'auto' );
		$body.removeAttr( 'style' );
		$stickyHeader.removeAttr( 'style' );
		$stickyNav.removeAttr( 'style' );
		$('.section-notification-bar').remove();
		Cookies.set('show-notification-bar', 'no', { expires: 1 })
	});


}(document, window, jQuery));