<?php
/*
Template Name: Regions
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
        // Default
        section_default();
        function section_default() {
                    
            global $post;
            
            $attr = array( 'class' => 'section-default' );
            
            $args = array(
                'html5'   => '<section %s>',
                'context' => 'section',
                'attr' => $attr,
            );
            
            _s_markup( $args );
            
            _s_structural_wrap( 'open' );
            
            print( '<div class="column row"><div class="entry-content">' );
            
            printf( '<span class="icon"><img src="%sregions/regions.svg" /></span>', trailingslashit( THEME_IMG ) );  
            
            $heading = get_field( 'heading' );
            echo _s_format_string( $heading, 'h3' );
                        
            print( '</div></div>' );
            
            _s_structural_wrap( 'close' );
            echo '</section>';
        }
    
        _s_get_template_part( 'template-parts/regions', 'map' );
	?>
	</main>


</div>

<?php
get_footer();
