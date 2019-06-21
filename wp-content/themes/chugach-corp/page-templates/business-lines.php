<?php
/*
Template Name: Business Lines
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
        _s_get_template_part( 'template-parts/portfolio', 'mission' );
        _s_get_template_part( 'template-parts/portfolio', 'portfolio' );
        _s_get_template_part( 'template-parts/portfolio', 'map' );
	?>
	</main>


</div>

<?php
get_footer();
