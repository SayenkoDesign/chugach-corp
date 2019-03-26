<?php
/**
 * The main template file.
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists.
 * @link http://codex.wordpress.org/Template_Hierarchy
 *
 * @package _s
 */

get_header(); ?>

<?php
// Hero
$args = array(
	'post_type'      => 'page',
	'p'				 => get_option('page_for_posts'),
	'posts_per_page' => 1,
	'post_status'    => 'publish'
);

// Use $loop, a custom variable we made up, so it doesn't overwrite anything
$loop = new WP_Query( $args );

// have_posts() is a wrapper function for $wp_query->have_posts(). Since we
// don't want to use $wp_query, use our custom variable instead.
if ( $loop->have_posts() ) : 
	while ( $loop->have_posts() ) : $loop->the_post(); 
	
		_s_get_template_part( 'template-parts/blog', 'hero' );
         
	endwhile;
endif;

// We only need to reset the $post variable. If we overwrote $wp_query,
// we'd need to use wp_reset_query() which does both.
wp_reset_postdata();

?>

<div class="row column">

    <div id="primary" class="content-area">
    
        <?php
        if( ! is_paged() ) {
            _s_get_template_part( 'template-parts/blog', 'videos' );
        }
        ?>
    
        <main id="main" class="site-main" role="main">            
                        
            <?php
             
            if ( have_posts() ) : ?>
            
                <header>
                <?php
                $heading = 'News';
                
                if( is_category() ) {
                    $heading = single_cat_title( '', false );
                }
                
                if( ! is_paged() ) {
                    printf( '<h2>%s</h2>', $heading );
                }
                ?>
                
                </header>
                
               <?php
               
               echo '<div class="row small-up-1 medium-up-2 large-up-3 xlarge-up-4 grid" data-equalizer data-equalize-on="large" data-equalize-by-row="true">';
                               
                while ( have_posts() ) :
    
                    the_post();
                                       
                    printf( '<div class="%s">', 'column column-block' );
                    
                    _s_get_template_part( 'template-parts', 'content-post-column' );
                    
                    echo '</div>';
    
                endwhile;
                
                echo '</div>';
                
                
                echo _s_paginate_links();
                                
            else :
    
                get_template_part( 'template-parts/content', 'none' );
    
            endif; ?>
                            
        </main>
        
        <?php
        if( ! is_paged() ) {
            _s_get_template_part( 'template-parts/blog', 'stories' );
        }
        
        _s_get_template_part( 'template-parts/blog', 'media-contact' );
        ?>
    
    </div>

</div>
    

<?php
get_footer();
