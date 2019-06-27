<?php
/**
 * The template for displaying search results pages.
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/#search-result
 *
 * @package _s
 */


get_header(); 

_s_get_template_part( 'template-parts/search', 'hero' );
?>

<div class="column row">
    
    <div id="primary" class="content-area">
    
        <main id="main" class="site-main" role="main">
            <?php
             
            if ( have_posts() ) :  
            
                while ( have_posts() ) :
    
                    the_post();
                    
                    //printf( '<h3>%s</h3>', get_the_title() );
    
                    get_template_part( 'template-parts/search/content', get_post_type() );
    
                endwhile;
                
                global $wp_query;                
                if( $wp_query->max_num_pages > 1 ) :
                    echo _s_paginate_links();
                endif;
                                
            else :
    
                get_template_part( 'template-parts/content', 'none' );
    
            endif; ?>
    
        </main>

</div>

<?php
get_footer();
