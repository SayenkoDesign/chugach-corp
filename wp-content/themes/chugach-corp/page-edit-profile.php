<?php
require_once( THEME_DIR . '/lib/functions/update-profile.php' );

// This page is only for logged in users
if( ! is_user_logged_in() ) {
    wp_redirect( site_url() );
    exit;
}

get_header(); ?>

<?php
_s_get_template_part( 'template-parts/my-account', 'hero' );
?>

<div id="primary" class="content-area">

	<main id="main" class="site-main" role="main">
	<?php
 	// Default
	section_default();
	function section_default() {
				
		global $post;
		
		$attr = array( 'class' => 'section default' );
		
		$args = array(
            'html5'   => '<section %s>',
            'context' => 'section',
            'attr' => $attr,
        );
        
        _s_markup( $args );
        
        _s_structural_wrap( 'open' );
		
		print( '<div class="column row">' );
            			
            echo '<div class="entry-content">';
            
            if( !empty( $_GET['updated'] ) ): ?>
                <div class="success"><?php _e('Profile successfully updated', 'textdomain'); ?></div>
            <?php endif; ?>

            <?php if( !empty( $_GET['validation'] ) ): ?>
                
                <?php if( $_GET['validation'] == 'emailnotvalid' ): ?>
                    <div class="error"><?php _e('The given email address is not valid', 'textdomain'); ?></div>
                <?php elseif( $_GET['validation'] == 'emailexists' ): ?>
                    <div class="error"><?php _e('The given email address already exists', 'textdomain'); ?></div>
                <?php elseif( $_GET['validation'] == 'passwordmismatch' ): ?>
                    <div class="error"><?php _e('The given passwords did not match', 'textdomain'); ?></div>
                <?php elseif( $_GET['validation'] == 'unknown' ): ?>
                    <div class="error"><?php _e('An unknown error accurd, please try again or contant the website administrator', 'textdomain'); ?></div>
                <?php endif; ?>

            <?php endif; ?>

            <?php $current_user = wp_get_current_user(); ?>

            <form method="post" id="adduser" action="<?php the_permalink(); ?>">

                <h3><?php _e('Personal info', 'textdomain'); ?></h3>

                <p>
                    <label for="first-name"><?php _e('Username', 'textdomain'); ?></label>
                    <input class="text-input" name="user_login" type="text" id="user_login" value="<?php the_author_meta( 'user_login', $current_user->ID ); ?>" disabled/>
                    <?php _e('It is not possible to change your username.', 'textdomain'); ?>
                </p>

                <p><?php _e('Please note, all information below is also shown on the website.', 'textdomain'); ?></p>

                <p>
                    <label for="first-name"><?php _e('First name', 'textdomain'); ?></label>
                    <input class="text-input" name="first-name" type="text" id="first-name" value="<?php the_author_meta( 'first_name', $current_user->ID ); ?>" />
                </p>

                <p>
                    <label for="last-name"><?php _e('Last name', 'textdomain'); ?></label>
                    <input class="text-input" name="last-name" type="text" id="last-name" value="<?php the_author_meta( 'last_name', $current_user->ID ); ?>" />
                </p>

                <p>
                    <?php _e('Public name:', 'textdomain'); ?> <?php echo $current_user->display_name; ?>
                </p>

                <p>
                    <label for="email"><?php _e('E-mail *', 'textdomain'); ?></label>
                    <input class="text-input" name="email" type="text" id="email" value="<?php the_author_meta( 'user_email', $current_user->ID ); ?>" />
                </p>

                <p>
                    <label for="phone"><?php _e('Phone', 'textdomain'); ?></label>
                    <input class="text-input" name="phone" type="text" id="phone" value="<?php the_author_meta( 'phone', $current_user->ID ); ?>" />
                </p>

                <p>
                    <label for="user_specialisation"><?php _e('Specialisation', 'textdomain'); ?></label>
                    <input class="text-input" name="user_specialisation" type="text" id="user_specialisation" value="<?php the_author_meta( 'specialisation', $current_user->ID ); ?>" />
                </p>

                <p>
                    <label for="location"><?php _e('Location', 'textdomain'); ?></label>
                    <input class="text-input" name="location" type="text" id="location" value="<?php the_author_meta( 'location', $current_user->ID ); ?>" />
                </p>

                <?php 
                    // action hook for plugin and extra fields
                    do_action('edit_user_profile', $current_user); 
                ?>

                <p><?php _e('Upload an image of 150x150', 'textdomain'); ?></p>

                <h3><?php _e('Change password', 'textdomain'); ?></h3>

                <p><?php _e('When both password fields are left empty, your password will not change', 'textdomain'); ?></p>

                <p class="form-password">
                    <label for="pass1"><?php _e('Password *', 'profile'); ?> </label>
                    <input class="text-input" name="pass1" type="password" id="pass1" />
                </p><!-- .form-password -->
                <p class="form-password">
                    <label for="pass2"><?php _e('Repeat password *', 'profile'); ?></label>
                    <input class="text-input" name="pass2" type="password" id="pass2" />
                </p><!-- .form-password -->

                <p class="form-submit">
                    <input name="updateuser" type="submit" id="updateuser" class="submit button" value="<?php _e('Update profile', 'textdomain'); ?>" />
                    <?php wp_nonce_field( 'update-user' ) ?>
                    <input name="honey-name" value="" type="text" style="display:none;"></input>
                    <input name="action" type="hidden" id="action" value="update-user" />
                </p><!-- .form-submit -->

            </form><!-- #adduser -->
            <?php
            
            
            echo '</div>';
						
		print( '</div>' );
        
		_s_structural_wrap( 'close' );
	    echo '</section>';
	}
	?>
	</main>


</div>

<?php
get_footer();
