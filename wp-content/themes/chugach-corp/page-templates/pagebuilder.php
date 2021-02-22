<?php
/*
Template Name: Page Builder Add-Ons
*/


/**
 * Custom Body Class
 *
 * @param array $classes
 * @return array
 */
function kr_body_class( $classes ) {
  unset( $classes[array_search('page-template-default', $classes )] );
  $classes[] = 'pagebuilder';
  return $classes;
}
add_filter( 'body_class', 'kr_body_class', 99 );


add_action( 'wp_enqueue_scripts', function () {
        wp_enqueue_script( 'lightgallery' );
        wp_enqueue_script( 'lightgallery-config' );
}, 10 );

add_action( 'wp_enqueue_scripts', function () {
  wp_enqueue_style( 'lightgallery-css', '//cdnjs.cloudflare.com/ajax/libs/lightgallery/1.6.12/css/lightgallery.min.css' );
 }, 15 );


get_header(); ?>

<?php
    _s_get_template_part( 'template-parts/pagebuilder', 'on-page-links' );
?>

<?php
    _s_get_template_part( 'template-parts/pagebuilder', 'hero' );
?>

<div id="primary" class="content-area">

	<main id="main" class="site-main" role="main">

	<?php
    while ( have_posts() ) :

        the_post();

        get_template_part( 'template-parts/content', 'pagebuilder' );

        endwhile;
	?>

	</main>


</div>

<!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/progressive-image.js/dist/progressive-image.css"> -->
<script src="https://cdn.jsdelivr.net/npm/progressive-image.js/dist/progressive-image.js"></script>

<script src="//cdn.jsdelivr.net/combine/npm/lightgallery,npm/lg-autoplay,npm/lg-fullscreen,npm/lg-hash,npm/lg-pager,npm/lg-thumbnail,npm/lg-video,npm/lg-zoom"></script>

<?php
get_footer();
