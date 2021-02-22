<?php

/****************************************
	Enqueue theme stylesheet
	*****************************************/

function _s_enqueue_stylesheet() {

	$version = defined( 'THEME_VERSION' ) && THEME_VERSION ? THEME_VERSION : '1.0';
	$handle  = defined( 'THEME_NAME' ) && THEME_NAME ? sanitize_title_with_dashes( THEME_NAME ) : 'theme';

	//$stylesheet = SCRIPT_DEBUG === true ? 'style.css' : 'style.min.css';
	$stylesheet = 'style.css';

	wp_enqueue_style( $handle, trailingslashit( THEME_URL ) . $stylesheet, false, $version );
 }

add_action( 'wp_enqueue_scripts', '_s_enqueue_stylesheet', 15 );


/****************************************
	Image Sizes
	*****************************************/

add_image_size( 'hero', 1440, 999 ); // 1440 x 510
add_image_size( 'leadership', 420, 999 );
add_image_size( 'icon-small', 100, 999 );
add_image_size( 'icon-medium', 160, 999 );
add_image_size( 'icon-large', 200, 999 );
add_image_size( 'lqip', 40, 0, false );
