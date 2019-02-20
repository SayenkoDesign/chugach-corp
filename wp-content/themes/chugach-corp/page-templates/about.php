<?php
/*
Template Name: About
*/

add_filter( 'body_class', function ( $classes ) {
  unset( $classes[ array_search('page-template-default', $classes ) ] );
  $classes[] = 'fixed-menu';
  return $classes;
}, 99 );

get_header(); ?>

<?php
_s_get_template_part( 'template-parts/about', 'hero' );
?>

<div id="primary" class="content-area">

	<main id="main" class="site-main" role="main">
	<?php
        _s_get_template_part( 'template-parts/about', 'content-about' );
        _s_get_template_part( 'template-parts/about', 'board' );
	?>
	</main>


</div>

<?php
get_footer();
