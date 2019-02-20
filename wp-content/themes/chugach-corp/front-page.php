<?php
/**
 * Custom Body Class
 *
 * @param array $classes
 * @return array
 */

add_filter( 'body_class', function( $classes ) {
    unset( $classes[array_search('page-template-default', $classes )] );
    $classes[] = 'fixed-menu';
    return $classes;
}, 99 );

get_header(); ?>

<?php
_s_get_template_part( 'template-parts/home', 'hero' );
?>

<div id="primary" class="content-area">

	<main id="main" class="site-main" role="main">
     
	<?php
     _s_get_template_part( 'template-parts/home', 'numbers' );
     
     _s_get_template_part( 'template-parts/home', 'donate' );
     
     _s_get_template_part( 'template-parts/home', 'how' );
          
     _s_get_template_part( 'template-parts/home', 'families' );
    
   	?>
        
	</main>


</div>

<?php
get_footer();
