
<div class="tabs-container">
    <?php
    _s_get_template_part( 'template-parts/my-account', 'tabs' );
    ?>
    <div class="tabs-content">
        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
            <div class="entry-content">
                <?php
                    $template = get_page_template_slug( get_the_ID() );
                    
                    $post_id = get_family_post_by_user_id();
                                        
                    if( 'page-templates/order-books.php' == $template ) { 
                        // Do they have a pending book request?
                        $days_since_last_dream_kit = _s_get_days_since_last_dream_kit();
                        
                        $show_order_books_form = true;
                        
                        if( $post_id &&  get_field( 'books_order_status_pending', $post_id ) ) {
                            $show_order_books_form = false;
                            $message = '<p class="text-center">You recent book order is currently under review.';     
                        } else {
                            if( _s_has_active_dream_kit() ) {
                                $show_order_books_form = false;
                            }
                            if( $days_since_last_dream_kit < 180 ) {
                                $show_order_books_form = false;
                            } 
                            
                            $message = sprintf( '<p class="text-center">You have %s days, until you can order 5 more books</p>', 
                                                 180 - $days_since_last_dream_kit );     
                        }
                                                                        
                        if( true === $show_order_books_form ) {
                                the_content();
                        }
                        else {
                             echo $message;
                        }
                        
                    } else {
                        
                        if( ! empty( $_GET['updated'] ) && !empty($_GET['msg'] ) ) {
                            $msg = sanitize_text_field( $_GET['msg'] );
                            printf( '<div id="message" class="updated"><p>%s</p></div>', $msg );
                        }
                        
                        the_content();
                    }
                
                    
                    if( 'page-templates/edit-bio.php' == $template ) {
                        _s_get_template_part( 'template-parts/my-account', 'content-edit-bio' );
                    }                    
                ?>
            </div><!-- .entry-content -->
        </article><!-- #post-## -->
    </div>
</div>