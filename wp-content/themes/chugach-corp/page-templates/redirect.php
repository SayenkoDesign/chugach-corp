<?php
/*
Template Name: Page Redirect
*/

$redirect = site_url();

$page = get_field( 'page' );

if( ! empty( $page ) ) {
    $redirect = $page;
}

$url = get_field( 'url' );

if( ! empty( $url ) ) {
    $redirect = $url;
}

wp_safe_redirect( $redirect, 302 );
exit();