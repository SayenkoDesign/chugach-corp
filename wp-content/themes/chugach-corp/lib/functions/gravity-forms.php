<?php

// Turn on label visibility
add_filter( 'gform_enable_field_label_visibility_settings', '__return_true' );

// On submit scroll back down to form
//add_filter( 'gform_confirmation_anchor', '__return_true' );

// Remove scroll to a specific form #5
//add_filter( 'gform_confirmation_anchor_5', '__return_false' );

/**
 * Filters the next, previous and submit buttons.
 * Replaces the forms <input> buttons with <button> while maintaining attributes from original <input>.
 *
 * @param string $button Contains the <input> tag to be filtered.
 * @param object $form Contains all the properties of the current form.
 *
 * @return string The filtered button.
 */
add_filter( 'gform_next_button', 'input_to_button', 10, 2 );
add_filter( 'gform_previous_button', 'input_to_button', 10, 2 );
add_filter( 'gform_submit_button', 'input_to_button', 10, 2 );
function input_to_button( $button, $form ) {
    $dom = new DOMDocument();
    $dom->loadHTML( $button );
    $input = $dom->getElementsByTagName( 'input' )->item(0);
    $new_button = $dom->createElement( 'button' );
    $new_button->appendChild( $dom->createTextNode( $input->getAttribute( 'value' ) ) );
    $input->removeAttribute( 'value' );
    foreach( $input->attributes as $attribute ) {
        $new_button->setAttribute( $attribute->name, $attribute->value );
    }
    $input->parentNode->replaceChild( $new_button, $input );
    
    $new_button_text = sprintf( '<span>%s</span>', $form['button']['text'] );
 
    $button =  $dom->saveHtml( $new_button );
    $button = str_replace( $form['button']['text'], $new_button_text, $button );
    
    return $button;
}


// Populate Locations
add_filter( 'gform_pre_render', 'populate_books' );
add_filter( 'gform_pre_validation', 'populate_books' );
add_filter( 'gform_pre_submission_filter', 'populate_books' );
add_filter( 'gform_admin_pre_render', 'populate_books' );


function _s_get_books() {
    // arguments, adjust as needed
	$args = array(
		'post_type'      => 'book',
		'posts_per_page' => -1,
		'post_status'    => 'publish',
        'order'          => 'ASC',
        'orderby'        => 'menu_order'
	);

	// Use $loop, a custom variable we made up, so it doesn't overwrite anything
	$loop = new WP_Query( $args );
    
    $list = [];

	// have_posts() is a wrapper function for $wp_query->have_posts(). Since we
	// don't want to use $wp_query, use our custom variable instead.
	if ( $loop->have_posts() ) : 
		while ( $loop->have_posts() ) : $loop->the_post(); 

			$list[] = get_the_title();

		endwhile;
	endif;

	// We only need to reset the $post variable. If we overwrote $wp_query,
	// we'd need to use wp_reset_query() which does both.
	wp_reset_postdata();
    
    return $list;   
}

function populate_books( $form ) {
 
    foreach ( $form['fields'] as &$field ) {
 
        if ( $field->type != 'select' || strpos( $field->cssClass, 'populate-books' ) === false ) {
            continue;
        }
 
        // you can add additional parameters here to alter the posts that are retrieved
        // more info: http://codex.wordpress.org/Template_Tags/get_posts
        $rows = _s_get_books();
         
        $choices = array();
 
        foreach ( $rows as $row ) {
            $choices[] = array( 'text' => $row, 'value' => $row );
        }
 
        // update 'Select a Post' to whatever you'd like the instructive option to be
        // $field->placeholder = 'Select a Location';
        $field->choices = $choices;
 
    }
 
    return $form;
}


// book order add pending status
add_action( 'gform_after_submission_5', 'set_book_order_pending_status', 10, 2 );
function set_book_order_pending_status( $entry, $form ) {
 
    $post_id = get_family_post_by_user_id();
 
    if( ! empty( $post_id ) ) {
        update_field('field_5c5c87779c156', 1, $post_id  );
    }
}




// Populate Locations
add_filter( 'gform_pre_render', 'populate_family' );
add_filter( 'gform_pre_validation', 'populate_family' );
add_filter( 'gform_pre_submission_filter', 'populate_family' );
add_filter( 'gform_admin_pre_render', 'populate_family' );


function _s_get_families() {
    
    $today = current_time( 'Ymd' ); // local time set under Settings > General
                                
    $meta_query = array(

        array(
            'key'			=> 'amount_owing',
            'compare'		=> '>',
            'value'			=> (int) 0, // needed
            'type'          => 'numeric' // needed
        ),
        array(
            'key'		=> 'start_date',
            'compare'	=> '<=',
            'value'		=> $today,
        )

    );
            
    $loop = new WP_Query( array(
        'post_type' => 'family',
        'order' => 'ASC',
        'meta_key' => 'start_date',
        'orderby'  => 'meta_value_num',
        'posts_per_page' => '4',
        'meta_query' => $meta_query,
    ) );

    
    $list = [];

	// have_posts() is a wrapper function for $wp_query->have_posts(). Since we
	// don't want to use $wp_query, use our custom variable instead.
	if ( $loop->have_posts() ) : 
		while ( $loop->have_posts() ) : $loop->the_post(); 

			$list[] = get_the_ID();

		endwhile;
	endif;

	// We only need to reset the $post variable. If we overwrote $wp_query,
	// we'd need to use wp_reset_query() which does both.
	wp_reset_postdata();
    
    return $list;   
}

function populate_family( $form ) {
 
    foreach ( $form['fields'] as &$field ) {
 
        if ( $field->type != 'select' || strpos( $field->cssClass, 'populate-family' ) === false ) {
            continue;
        }
 
        // you can add additional parameters here to alter the posts that are retrieved
        // more info: http://codex.wordpress.org/Template_Tags/get_posts
        $rows = _s_get_families();
         
        $choices = array();
        
        $choices[] = array( 'value' => 'next person in line', 'text' => 'Next person in line or select family' );
        
        $selected = 0;
        if( ! empty( $_GET['family_id'] ) ) {
            $selected = absint( $_GET['family_id'] );
        }
 
        foreach ( $rows as $row ) {
            $value = get_the_title( $row );
            $text = $value;
            $amounts = dream_kits_calculate_amount_needed( $row );
            if( ! empty( $amounts ) ) {
                $still_needed = $amounts['still_needed'];
                if( $still_needed > 0 ) {
                    $value = sprintf( '%s [%s|%d]', _s_get_family_name( $row ), $still_needed, $row );
                    $text =  sprintf( '%s $%s Still Needed', _s_get_family_name( $row ), $still_needed );
                }
            }
            
            $args = array( 'value' => $value, 'text' => $text );
            
            if( $selected === $row ) {
                $args['isSelected'] = true;
            }
            
            $choices[] = $args;
        }
 
        // update 'Select a Post' to whatever you'd like the instructive option to be
        // $field->placeholder = 'Select a Location';
        $field->choices = $choices;
 
    }
 
    return $form;
}

add_filter( 'gform_field_value_donate', 'donate_form_populate_donate' );
function donate_form_populate_donate( $value ) {
    
    if( empty( $_GET['family_id'] ) ) {
        return '';
    }
    
    return 'Other';
    
}


//add_filter( 'gform_notification_8', 'notification_routing', 10, 3 );
function notification_routing( $notification, $form, $entry ) {
    if ( $notification['name'] == 'User Notification' ) {
        
        $family = $entry[5];
        $donate = $entry[1];
        $other = $entry[4];
        
        $amount = 0;
        if( $donate ) {
            $amount = $donate;
        } else {
            $amount = $other;   
        }
        
        preg_match( '/\[(.*?)\]/', $family, $matches );
        if( ! empty( $matches[1] ) ) {
            $string = explode( '|', $matches[1] );
            $post_id = false;
            if( ! empty( $string[1] ) ) {
                $post_id = absint( $string[1]);
                $notification['message'] = sprintf( "Thank you for donating %s to the %s. They're Dream Kit is on the way!",
                                                    $amount,
                                                    _s_get_family_name( $post_id )
                                                    
         );
            }
            
        }
        
        
    }
 
    return $notification;
}
