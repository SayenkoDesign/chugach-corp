<?php
/*
Template Name: Shareholder
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
        _s_get_template_part( 'template-parts/shareholder', 'services' );
        _s_get_template_part( 'template-parts/shareholder', 'development' );
        _s_get_template_part( 'template-parts/shareholder', 'insights' );
        
        _s_get_template_part( 'template-parts/blog', 'stories' );
	?>
	</main>


</div>

<?php
get_footer();
