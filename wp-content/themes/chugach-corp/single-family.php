<?php

get_header(); 

/*
post-hero = family name

photo
city, state, family size
tabs - bio/ books (list of books and total costs of books), taxes, operations, total
progress
donate button
share buttons
books
*/


if( ! is_user_logged_in() && ! _s_has_active_dream_kit() ) {
    wp_redirect( get_post_type_archive_link( 'family' ) );
    exit;
}
?>

<?php
_s_get_template_part( 'template-parts/family', 'post-hero' );
?>

<div class="column row">
    
    <div id="primary" class="content-area">
    
        <main id="main" class="site-main" role="main">
            <?php
            while ( have_posts() ) :

                the_post();
                
                
                
                $amounts = dream_kits_calculate_amount_needed();
                $still_needed = 0;
                if( ! empty( $amounts['still_needed'] ) ) {
                    $still_needed = $amounts['still_needed'];
                }
                
                $thumbnail = _s_get_family_photo();
                $family_name = _s_get_family_name();
                $location    = _s_get_family_location();
                $family_size = _s_get_family_size();
                $bio = _s_get_family_bio();
                $photo =_s_get_family_photo();
                $progress_bar = _s_get_family_progress_bar();
                
                $dream_kit = _s_get_active_dream_kit();
                
                $data = [
                    'famil_name' => $family_name,
                    'bio' => $bio,
                    'thumbnail' => $thumbnail,
                    'progress_bar' => $progress_bar,
                    'dream_kit' => $dream_kit
                
                ];
                
                $content = '';
                
                $content .= sprintf( '<div class="column small-12 large-expand shrink"><div class="family-photo">%s%s%s</div></div>', $photo, $location, $family_size );
                
                $tabs = _s_get_template_part( 'template-parts/family', 'content-tabs', $data, true );
                
                if( ! empty( $tabs ) ) {
                    $content .= sprintf( '<div class="column small-12 large-expand">%s</div>', $tabs );
                }
                
                
                
                $content .= sprintf( '<div class="column small-12 large-expand shrink"><div class="progress-donate">%s%s<h3><span>Share This</span></h3>%s</div></div>', 
                        $progress_bar,
                        sprintf( '<p><a href="%s?family_id=%s&still_needed=%s" class="button xlarge"><span>Donate Now</span></a></p>', get_permalink( 15 ), get_the_ID(), $still_needed ),
                        _s_get_addtoany_share_icons()
                );
                
                printf( '<div class="family-details"><div class="row">%s</div></div>', $content );
                                    
                _s_get_template_part( 'template-parts/family', 'content-books', $data );
                
                $post_ids = _s_get_family_post_ids();
                $nav_links = '';   
                                
                if( ! empty( $post_ids ) ) {
                    $previous_post_id = find_prev_array_value( get_the_ID(), $post_ids );
                    if( $previous_post_id ) {
                        $nav_links .= sprintf( '<div class="nav-previous"><a href="%s"><span class="screen-reader-text">&laquo; %s</span></a></div>',
                                                get_the_permalink( $previous_post_id ), __( 'Previous Page' ) );
                    } else {
                       $nav_links .= sprintf( '<div class="nav-previous"><a class="disable"><span class="screen-reader-text">&laquo; %s</span></a></div>',
                                              __( 'Previous Page' ) ); 
                    }
                    
                    $nav_links .= sprintf( '<div class="all"><a href="%s"><span>%s</span></a></div>',
                                            get_post_type_archive_link( 'family' ), __( 'All Families' ) ); 
                                            
                    $next_post_id = find_next_array_value( get_the_ID(), $post_ids );
                    
                    if( $next_post_id ) {
                        $nav_links .= sprintf( '<div class="nav-next"><a href="%s"><span class="screen-reader-text">%s <strong></strong></span></a></div>',
                                                get_the_permalink( $next_post_id ), __( 'Next Page' ) );
                    } else {
                       $nav_links .= sprintf( '<div class="nav-next"><a class="disable"><span class="screen-reader-text">%s &raquo;</span></a></div>',
                                              __( 'Next Page' ) ); 
                    }
                }
                                                                
            endwhile;
                     
           ?>
           
            <?php
            if( ! empty( $nav_links ) ) {
                printf( '<nav class="navigation post-navigation" role="navigation"><h2 class="screen-reader-text">Post navigation</h2><div class="nav-links align-middle">%s</div></div>',  
                         $nav_links );
            }
            
            ?>           
    
        </main>
    
    </div>
        
</div>


<?php
get_footer();
