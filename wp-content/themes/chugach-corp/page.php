<?php
/**
 * The template for displaying all pages.
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site may use a
 * different template.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package _s
 */

add_action( 'wp_enqueue_scripts', function () {
        wp_enqueue_script( 'lightgallery' );
        wp_enqueue_script( 'lightgallery-config' );
}, 10 );

add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style( 'lightgallery-css', '//cdnjs.cloudflare.com/ajax/libs/lightgallery/1.6.12/css/lightgallery.min.css' );
 }, 15 );
 
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
		
		print( '<div class="column row">' );
		
		while ( have_posts() ) :

			the_post();
            			
            echo '<div class="entry-content">';
            
			the_content();
            
            echo '</div>';
				
		endwhile;
		
		print( '</div>' );
        
		_s_structural_wrap( 'close' );
	    echo '</section>';
	}
	?>
	</main>


</div>

<?php
get_footer();
