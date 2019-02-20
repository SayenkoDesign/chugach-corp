<?php
$dream_kit = $data['dream_kit'];
$books = $dream_kit['books'];

function _s_get_family_books( $books ) {
    
    $post_ids = $books;
    
    if( empty( $post_ids ) ) {
        return false;   
    }
        
    $args = array(
        'post_type' => 'book',
        'orderby' => 'post__in',
        'post__in' => $post_ids,
        'posts_per_page' => count( $post_ids )
    );
                
    $loop = new WP_Query( $args );
    
    $out = '';
    
    if ( $loop->have_posts() ) :  
    
        echo '<div class="wish-list-books">';
        
        printf( '<header><h3>%s</h3></header>', 'Wish List of Books' );
        
        echo '<div class="grid-wrapper" data-equalizer="thumbnail" data-equalize-on="medium">';
    
        echo '<div class="row small-up-1 medium-up-2 large-up-3 xlarge-up-5 grid" data-equalizer="panel" data-equalize-on="medium">';
    
        while ( $loop->have_posts() ) :
    
            $loop->the_post(); 
            
            printf( '<div class="column column-block">%s</div>', _s_get_template_part( 'template-parts/books', 'book-column', false, true ) );
    
        endwhile;
        
        echo '</div>';
        
        echo '</div>';
        
        echo '</div>';
        
    endif; 
    
    wp_reset_postdata();
}

_s_get_family_books( $books );