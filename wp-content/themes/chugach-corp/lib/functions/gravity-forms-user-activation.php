<?php

/**
 * Gravity Forms Custom Activation Template
 * http://gravitywiz.com/customizing-gravity-forms-user-registration-activation-page
 */
function hc_gf_maybe_activate_user() {

    $template_path = STYLESHEETPATH . '/gf-activate-template/activate.php';
    $is_activate_page = isset( $_GET['page'] ) && $_GET['page'] == 'gf_activation';
    
    if( ! file_exists( $template_path ) || ! $is_activate_page  )
        return;
    
    require_once( $template_path );
    
    exit();
}

add_action('wp', 'hc_gf_maybe_activate_user', 9);


/**
 * LearnDash set group upon Gravity Forms user activation
 *
 * @since 	1.0
 */
function after_user_activate( $user_id, $user_data, $signup_meta ) {
    
    
    $user_info = get_user_meta( $user_id );
    
    // return
    
    // Create unique post slug
    
    $post_title = sprintf( '%s - %s, %s', $user_info['last_name'][0], $user_info['city'][0], $user_info['state'][0] );
    $post_name = sprintf( '%s %s %s', $user_info['last_name'][0], $user_info['city'][0], $user_info['state'][0] );
    // Let's create an empty family post here
    $post_args = [
        'post_title'=>$post_title, 
        'post_name' => sanitize_title_with_dashes( $post_name ),
        'post_type' =>'family',
        'post_status' => 'publish',
        'post_author' => $user_id
    ];
    
    error_log( print_r( $user_id, 1 ) );
    
    $post_id = wp_insert_post( $post_args );
    
    $field_key = "field_5c5d3d8c95a53";
    $value = $user_info['last_name'][0];
    update_field( $field_key, $value, $post_id );
    
    $field_key = "field_5c5c903921e59";
    $value = $user_info['city'][0];
    update_field( $field_key, $value, $post_id );
    
    $field_key = "field_5c5d2bcdf53d9";
    $value = $user_info['state'][0];
    update_field( $field_key, $value, $post_id );
}

add_action( 'gform_activate_user', 'after_user_activate', 10, 3 );