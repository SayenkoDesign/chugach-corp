<?php
/*
Template Name: Careers
*/

add_filter( 'body_class', function ( $classes ) {
  unset( $classes[ array_search('page-template-default', $classes ) ] );
  $classes[] = '';
  return $classes;
}, 99 );

get_header(); ?>

<?php
_s_get_template_part( 'template-parts/global', 'hero' );
?>

<div id="primary" class="content-area">

	<main id="main" class="site-main" role="main">
	<?php
        echo do_shortcode( '[chugach_careers]' );

        _s_get_template_part( 'template-parts/careers', 'introduction' );
        _s_get_template_part( 'template-parts/careers', 'why' );
        _s_get_template_part( 'template-parts/careers', 'shareholders' );
        _s_get_template_part( 'template-parts/careers', 'testimonials' );
	?>
	</main>


</div>

<?php
get_footer();
