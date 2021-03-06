<?php
/**
 * The template for displaying 404 pages (not found).
 *
 * @link https://codex.wordpress.org/Creating_an_Error_404_Page
 *
 * @package _s
 */

get_header(); ?>

<?php
_s_get_template_part( 'template-parts/404', 'hero' );
?>

<div id="primary" class="content-area">

	<main id="main" class="site-main" role="main">
	
		<section class="section-default">
			<div class="column row">
	
				<div class="entry-content">
					<?php
                    $fields = get_field( 'page_404', 'option' ); 
                    if( ! empty( $fields['text'] ) ) {
                        echo $fields['text'];
                    }
                    ?>
				</div><!-- .page-content -->
                
                <?php
                get_search_form();
                ?>
				
				</div>
		</section>

	</main><!-- #main -->

</div><!-- #primary -->

	

<?php
get_footer();
