<?php
/*
Template Name: Portfolio - Operating Companies
*/

add_filter( 'body_class', function ( $classes ) {
  unset( $classes[ array_search('page-template-default', $classes ) ] );
  $classes[] = '';
  return $classes;
}, 99 );

get_header(); ?>

<?php
_s_get_template_part( 'template-parts/portfolio', 'hero' );
?>

<div id="primary" class="content-area">

	<main id="main" class="site-main" role="main">
	<?php
        _s_get_template_part( 'template-parts/portfolio', 'menu' );
        _s_get_template_part( 'template-parts/portfolio', 'introduction' );
        _s_get_template_part( 'template-parts/portfolio', 'businesses' );
        _s_get_template_part( 'template-parts/blog', 'stories' );
	?>
	</main>


</div>

<?php
get_footer();
