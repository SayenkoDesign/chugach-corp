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
$page = get_field( 'page_404', 'option' );

get_template_part( 'template-parts/global', 'hero' );
?>

<div id="primary" class="content-area">

	<main id="main" class="site-main" role="main">
	
		<section class="section-default">
			<div class="column row">
	
				<div class="entry-content">
					<p>page not found custom</p>
				</div><!-- .page-content -->
				
				</div>
		</section>

	</main><!-- #main -->

</div><!-- #primary -->

	

<?php
get_footer();
