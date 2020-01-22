<?php
$hero = get_field( 'hero', get_queried_object() );
if( empty( 'hero' ) ) {
    _s_get_template( 'home.php' );
    exit;
}

get_header(); ?>

<?php
_s_get_template_part( 'template-parts/blog', 'hero-category' );

// We only need to reset the $post variable. If we overwrote $wp_query,
// we'd need to use wp_reset_query() which does both.
wp_reset_postdata();

?>

<div class="row column">

    <div id="primary" class="content-area">
    
        <main id="main" class="site-main" role="main">            
                        
            <?php
             
            if ( have_posts() ) : ?>
            
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

        _s_get_template_part( 'template-parts/blog', 'stories' );
        
        _s_get_template_part( 'template-parts/blog', 'media-contact' );
        
        ?>
    
    </div>

</div>
    

<?php
_s_get_template_part( 'template-parts/blog', 'share-story' );

get_footer();
