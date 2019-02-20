<?php


function ecs_add_post_state( $post_states, $post ) {

	if( $post->post_name == 'edit-profile' ) {
		$post_states[] = 'Profile edit page';
	}

	return $post_states;
}

add_filter( 'display_post_states', 'ecs_add_post_state', 10, 2 );



// Add notice to the Profile Edit Page
function ecs_add_post_notice() {

	global $post;

	if( isset( $post->post_name ) && ( $post->post_name == 'edit-profile' ) ) {
	  /* Add a notice to the edit page */
		add_action( 'edit_form_after_title', 'ecs_add_page_notice', 1 );
		/* Remove the WYSIWYG editor */
		remove_post_type_support( 'page', 'editor' );
	}	
}

function ecs_add_page_notice() {
	echo '<div class="notice notice-warning inline"><p>' . __( 'You are currently editing the profile edit page. Do not edit the title or slug of this page!', 'textdomain' ) . '</p></div>';
}

add_action( 'admin_notices', 'ecs_add_post_notice' );

// remove Yoast SEO box from Edit profile
function my_remove_metabox() {
    global $post;
    
	if( isset( $post->post_name ) && ( $post->post_name == 'edit-profile' ) ) {
        remove_meta_box( 'wpseo_meta', 'page', 'normal' );
        remove_meta_box( 'wpseo_meta', 'page', 'low' );
    }
}

add_action( 'add_meta_boxes', 'my_remove_metabox', 11 );


// Redirect user profile page to the "edit password" page
function no_proflie_admin_pages_redirect() {
  global $pagenow;
  if( ! current_user_can('manage_options') ) {
      $admin_redirects = array(
                'profile.php'
            );
      if( in_array( $pagenow, $admin_redirects ) ){
        wp_redirect ( get_permalink( 634 ) );
        exit;
      }
  }
}
add_action('admin_init', 'no_proflie_admin_pages_redirect');


// Add custom fields for user registration
function hr_custom_contact_info( $fields ) {
    
    $user_registration_fields = [
        'phone'=>'Phone',
        'address'=>'Address',
        'city'=>'City',
        'state'=>'State',
        'zipcode'=>'zipcode',        
    ];
     
    $fields = array_splice($fields, 0, 0) + $user_registration_fields + $fields;

    // Return the amended contact fields.
    return $fields;
     
}

add_filter( 'user_contactmethods', 'hr_custom_contact_info' );
