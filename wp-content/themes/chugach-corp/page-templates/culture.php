<?php
/*
Template Name: Culture
*/

add_filter( 'body_class', function ( $classes ) {
  unset( $classes[ array_search('page-template-default', $classes ) ] );
  $classes[] = '';
  return $classes;
}, 99 );


add_action( 'wp_enqueue_scripts', function () {
        wp_enqueue_script( 'lightgallery' );
        wp_enqueue_script( 'lightgallery-config' );
}, 10 );

add_action( 'wp_enqueue_scripts', function () {

	$version = defined( 'THEME_VERSION' ) && THEME_VERSION ? THEME_VERSION : '1.0';
	$handle  = defined( 'THEME_NAME' ) && THEME_NAME ? sanitize_title_with_dashes( THEME_NAME ) : 'theme';

	//$stylesheet = SCRIPT_DEBUG === true ? 'style.css' : 'style.min.css';
	$stylesheet = 'style.css';

	wp_enqueue_style( 'lightgallery-css', '//cdnjs.cloudflare.com/ajax/libs/lightgallery/1.6.12/css/lightgallery.min.css' );
 }, 15 );

get_header(); ?>

<?php
_s_get_template_part( 'template-parts/global', 'hero' );
?>

<div id="primary" class="content-area">

	<main id="main" class="site-main" role="main">
	<?php
        _s_get_template_part( 'template-parts/culture', 'introduction' );
        _s_get_template_part( 'template-parts/culture', 'gallery' );
        _s_get_template_part( 'template-parts/culture', 'information' );
        _s_get_template_part( 'template-parts/blog', 'stories' );
	?>
	</main>


</div>

<?php
get_footer();
