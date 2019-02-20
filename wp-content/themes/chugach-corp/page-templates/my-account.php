<?php
/*
Template Name: My Account
*/

if( ! is_user_logged_in() ) {
    wp_redirect( site_url() );
    exit;
}

$order_books_page_id = _s_get_page_id_from_template_name( 'page-templates/order-books.php' );

if( ! empty( $order_books_page_id ) ) {
    wp_redirect( get_permalink( $order_books_page_id ) );
    exit;
} else {
    wp_redirect( site_url() );   
    exit;
}