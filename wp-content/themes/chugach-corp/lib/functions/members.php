<?php
// Member functions


/**
 * Redirect loggedin users back to homepage if they try to access this page when logged in
 *
 * @since 	1.0
 */


// Logged in pages to ignore
add_action( 'template_redirect', function() {
    global $post;
    if ( is_user_logged_in() && ( 
    
        is_page_template( 'page-templates/login.php' ) || 
        is_page_template( 'page-templates/lost-password.php' ) ||
        is_page_template( 'page-templates/register.php' )
            
           
       ) ) 
    {
        wp_redirect( site_url() );
        die;
	}
    
});

// Logged out pages set to private/learndash && bbpress
add_action( 'template_redirect', function() {
    global $post;
    if ( ! is_user_logged_in() && (
        'private' == get_post_status() ||
        is_page_template( 'page-templates/edit-bio.php' )       
       ) )
    {         
        wp_redirect( site_url() );
        die;
	}
});


// show admin bar only for admins and editors
if (!current_user_can('edit_posts')) {
	add_filter('show_admin_bar', '__return_false');
}

// redirect subscribers away from wp-admin
function redirect_non_admin_user(){
    if ( is_user_logged_in() ) {
        if ( ! defined( 'DOING_AJAX' ) && current_user_can('subscriber') ){
            wp_redirect( site_url() );  exit;
        }
    }
}
add_action( 'admin_init', 'redirect_non_admin_user' );


/**
 * Check if login page
 *
 * @since 	1.0
 */
function is_login_page() {
    return in_array($GLOBALS['pagenow'], array('wp-login.php', 'wp-register.php'));
}


/**
 * Redirect non-admins to the homepage after logging into the site.
 *
 * @since 	1.0
 */
function _s_login_redirect( $redirect_to, $request, $user  ) {
    $my_account_page_id = _s_get_page_id_from_template_name( 'page-templates/my-account.php' );   
    $custom_redirect = ! empty( $my_account_page_id ) ? get_permalink( $my_account_page_id ) : home_url(); 
	return ( ! empty( $user->roles ) && in_array( 'administrator', $user->roles ) ) ? admin_url() : $custom_redirect;
}
add_filter( 'login_redirect', '_s_login_redirect', 10, 3 );


/**
 * Redirect to the homepage after logging out.
 *
 * @since 	1.0
 */
function _s_redirect_after_logout(){
    wp_redirect( home_url() );
    exit();
}
add_action('wp_logout','_s_redirect_after_logout');


/**
 * Get current user role
 *
 * @since 	1.0
 */
function _s_get_user_role( $user = null ) {
	$user = $user ? new WP_User( $user ) : wp_get_current_user();
	return $user->roles ? array_values( $user->roles )[0] : false;
}

/**
 * Find out if they are a user. We do it this way so that anyone that can read can see content.
 *
 * @since 	1.0
 */
function _s_is_member() {
	return current_user_can( 'read' ) ? true : false;
}

/**
 * Displays signup login message
 *
 * @since  0.1.0
 * @access public
 * @return string
 */
function _s_members_login_message() {
    if( ! is_user_logged_in() ) {
        return _s_members_only_message();   
    }  
}

add_shortcode( 'members_login_message', '_s_members_login_message' );



/**
 * Displays reset password link
 *
 * @since  0.1.0
 * @access public
 * @return string
 */
function _s_reset_password_link() {
    return sprintf( '<a href="%s/lost-password/">%s</a>', site_url(), __( 'Forgot your password?' ) );
}

add_shortcode( 'reset_password_link', '_s_reset_password_link' );


/**
 * Displays reset password form
 *
 * @since  0.1.0
 * @access public
 * @return string
 */
function _s_reset_password_shortcode( $attr, $content = null ) {
    
    ob_start( );
    ?>
    <form method="post" action="<?php echo wp_lostpassword_url() ?>" id="passwordform">
        <p class="username">
            <label for="user_login" class=""><?php _e('Username or Email'); ?></label>
            <input type="text" name="user_login" value="" size="20" id="user_login" tabindex="1001" />
        </p>
        <p class="login-submit">
            <?php do_action('login_form', 'resetpass'); ?>
            <button class="button"><span><?php _e('Reset my password'); ?></span></button>
         </p>
    </form>
    <?php
    $output = ob_get_clean( );
    
    return $output;
     
}

add_shortcode( 'lost_password_form', '_s_reset_password_shortcode' );



function _s_wp_login_form( $args = array() ) {
	$defaults = array(
		'echo' => true,
		// Default 'redirect' value takes the user back to the request URI.
		'redirect' => ( is_ssl() ? 'https://' : 'http://' ) . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'],
		'form_id' => 'loginform',
		'label_username' => __( 'Username or Email Address' ),
		'label_password' => __( 'Password' ),
		'label_remember' => __( 'Remember Me' ),
		'label_log_in' => __( 'Log In' ),
		'id_username' => 'user_login',
		'id_password' => 'user_pass',
		'id_remember' => 'rememberme',
		'id_submit' => 'wp-submit',
		'remember' => true,
		'value_username' => '',
		// Set 'value_remember' to true to default the "Remember me" checkbox to checked.
		'value_remember' => false,
	);

	/**
	 * Filters the default login form output arguments.
	 *
	 * @since 3.0.0
	 *
	 * @see wp_login_form()
	 *
	 * @param array $defaults An array of default login form arguments.
	 */
	$args = wp_parse_args( $args, apply_filters( 'login_form_defaults', $defaults ) );

	/**
	 * Filters content to display at the top of the login form.
	 *
	 * The filter evaluates just following the opening form tag element.
	 *
	 * @since 3.0.0
	 *
	 * @param string $content Content to display. Default empty.
	 * @param array  $args    Array of login form arguments.
	 */
	$login_form_top = apply_filters( 'login_form_top', '', $args );

	/**
	 * Filters content to display in the middle of the login form.
	 *
	 * The filter evaluates just following the location where the 'login-password'
	 * field is displayed.
	 *
	 * @since 3.0.0
	 *
	 * @param string $content Content to display. Default empty.
	 * @param array  $args    Array of login form arguments.
	 */
	$login_form_middle = apply_filters( 'login_form_middle', '', $args );

	/**
	 * Filters content to display at the bottom of the login form.
	 *
	 * The filter evaluates just preceding the closing form tag element.
	 *
	 * @since 3.0.0
	 *
	 * @param string $content Content to display. Default empty.
	 * @param array  $args    Array of login form arguments.
	 */
	$login_form_bottom = apply_filters( 'login_form_bottom', '', $args );

	$form = '
		<form name="' . $args['form_id'] . '" id="' . $args['form_id'] . '" action="' . esc_url( site_url( 'wp-login.php', 'login_post' ) ) . '" method="post">
			' . $login_form_top . '
			<p class="login-username">
				<label for="' . esc_attr( $args['id_username'] ) . '">' . esc_html( $args['label_username'] ) . '</label>
				<input type="text" name="log" id="' . esc_attr( $args['id_username'] ) . '" class="input" value="' . esc_attr( $args['value_username'] ) . '" size="20" />
			</p>
			<p class="login-password">
				<label for="' . esc_attr( $args['id_password'] ) . '">' . esc_html( $args['label_password'] ) . '</label>
				<input type="password" name="pwd" id="' . esc_attr( $args['id_password'] ) . '" class="input" value="" size="20" />
			</p>
			' . $login_form_middle . '
			' . ( $args['remember'] ? '<p class="login-remember"><label><input name="rememberme" type="checkbox" id="' . esc_attr( $args['id_remember'] ) . '" value="forever"' . ( $args['value_remember'] ? ' checked="checked"' : '' ) . ' /> ' . esc_html( $args['label_remember'] ) . '</label></p>' : '' ) . '
			<p class="login-submit">
				<button name="wp-submit" id="' . esc_attr( $args['id_submit'] ) . '" class="button button-primary">' . $args['label_log_in'] . '</button>
				<input type="hidden" name="redirect_to" value="' . esc_url( $args['redirect'] ) . '" />
			</p>
			' . $login_form_bottom . '
		</form>';

	if ( $args['echo'] )
		echo $form;
	else
		return $form;
}




function _s_login_form_shortcode() {
	return _s_wp_login_form( array( 
        'label_username' => __( 'Username or Email' ), 
        'label_log_in' => sprintf( '<span>%s</span>', __( 'Sign In' ) ), 
        'echo' => false ) 
    );
}
add_shortcode( 'login_form', '_s_login_form_shortcode' );




/**
 * Display user info
 *
 * @since  0.1.0
 * @access public
 * @param  array   $attr
 * @return string
 */
function _s_user_info( $atts = '' ) {
	
	$a = shortcode_atts( array(
        'value' => 'user_firstname',
    ), $atts );
	
	if( is_user_logged_in() ) {
		// Hello [username]! My Account (link to profile) 
		$user = wp_get_current_user();
		$detail = $a['value'];
		return 	( isset( $user->{$detail} ) ) ? $user->{$detail} : 'User';
	}
	
	return 'User';	
}

add_shortcode( 'user_info', '_s_user_info' );



/**
 * Display logout link
 *
 * @since  0.1.0
 * @access public
 * @return string
 */
function _s_logout_url() {
	return sprintf('<a href="%s">Logout</a>', wp_logout_url( site_url() ) );
}

add_shortcode( 'logout', '_s_logout_url' );



function _s_show_members_only_message() {
	if( !is_user_logged_in() )
		return _s_members_only_message();	
}

add_shortcode( 'show_members_only_message', '_s_show_members_only_message' );
