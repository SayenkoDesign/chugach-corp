<?php

// Redirect Region and Industries (we usually do this when using the single term radion button plugin)
function _redirect_single_book()
{
    if ( is_tax( 'book_category' ) || is_singular( 'book' ) ) {
        wp_safe_redirect( get_post_type_archive_link( 'book' ), 302 );
        exit();
    }
}
add_action( 'template_redirect', '_redirect_single_book' );