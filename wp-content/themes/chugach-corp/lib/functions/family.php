<?php

function get_family_post_by_user_id() {
    
    // Let's Admin test other users
    if( ! current_user_can('subscriber') ) {
        return false;
    }
        
    $args = array(
		'post_type'      => 'family',
        'author'    =>  get_current_user_id(),
        'orderby'        =>  'post_date',
        'order'          =>  'DESC',
		'posts_per_page' => 1,
		'post_status'    => 'publish',
	);
    
	// Use $loop, a custom variable we made up, so it doesn't overwrite anything
	$loop = new WP_Query( $args );
    
    $post_id = false;

	// have_posts() is a wrapper function for $wp_query->have_posts(). Since we
	// don't want to use $wp_query, use our custom variable instead.
	if ( $loop->have_posts() ) : 
		while ( $loop->have_posts() ) : $loop->the_post(); 
            $post_id = get_the_ID();
		endwhile;
	endif;

	wp_reset_postdata();
    
    return $post_id;
}


function th_get_roles_for_post_type( $post_type ) {
    global $wp_roles;

    $roles = array();
    $type  = get_post_type_object( $post_type );

    // Get the post type object caps.
    $caps = array( $type->cap->edit_posts, $type->cap->publish_posts, $type->cap->create_posts );
    $caps = array_unique( $caps );

    // Loop through the available roles.
    foreach ( $wp_roles->roles as $name => $role ) {

        foreach ( $caps as $cap ) {

            // If the role is granted the cap, add it.
            if ( isset( $role['capabilities'][ $cap ] ) && true === $role['capabilities'][ $cap ] ) {
                $roles[] = $name;
                break;
            }
        }
    }

    return $roles;
}

add_action( 'load-post.php',     'th_load_user_dropdown_filter' );
add_action( 'load-post-new.php', 'th_load_user_dropdown_filter' );

function th_load_user_dropdown_filter() {
    $screen = get_current_screen();

    if ( empty( $screen->post_type ) || 'family' !== $screen->post_type )
        return;

    add_filter( 'wp_dropdown_users_args', 'th_dropdown_users_args', 10, 2 );
}

function th_dropdown_users_args( $args, $r ) {
    global $wp_roles, $post;

    // Check that this is the correct drop-down.
    if ( 'post_author_override' === $r['name'] && 'family' === $post->post_type ) {

        $roles = th_get_roles_for_post_type( $post->post_type );
        $roles[] = 'subscriber';

        // If we have roles, change the args to only get users of those roles.
        if ( $roles ) {
            $args['who']      = '';
            $args['role__in'] = $roles;
        }
    }

    return $args;
}


function _s_disable_amount_owing_field($field) {
	$field['disabled'] = 1;
    $field['readonly'] = 1;
	return $field;
}

add_filter('acf/load_field/key=field_5c5d1fc44cfe7', '_s_disable_amount_owing_field');
add_filter('acf/load_field/key=field_5c5d111428ff7', '_s_disable_amount_owing_field');
add_filter('acf/load_field/key=field_5c5e1d9e3f2dd', '_s_disable_amount_owing_field');

// create a function that will convert this repeater during the acf/save_post action
// priority of 20 to run after ACF is done saving the new values
 
function dream_kits_calculate_amount_owing($post_id) {

  $meta_key = '_amount_owing';
      
  // now we'll look at the repeater and save any values
  if ( have_rows('dream_kits', $post_id ) ) {
    while ( have_rows('dream_kits', $post_id ) ) {
      the_row();
      
      $amount = 0;
            
      $total = 0;
      $total_cost = 0;
      $donation_amounts = 0;
      
      $total_cost = get_sub_field('total_cost');
      
      if( empty( $total_cost ) ) {
          continue;
      }
      
      $total_cost = $total_cost;
      
      $donations = get_sub_field('donations');
      if( ! empty( $donations ) ) {
          foreach( $donations as $donation ) {
              $donation_amounts += $donation['amount'];
          }
      }
      
      $amount = $total_cost - $donation_amounts;
            
      update_post_meta( $post_id, $meta_key, $amount );
      
      // update Dream kit amount owing
      update_sub_field('field_5c5d1fc44cfe7', $amount );
      
      
      $start_date = get_sub_field('start_date');
      // if missing start date we don't calculate
      if( empty( $start_date ) ) {
          $amount = 0;
      }
      
      $end_date = get_sub_field('end_date');
      // if closed we don't calculate
      if( ! empty( $end_date ) ) {
          $amount = 0;
      }
      
      // Update total amount owing
      update_field('field_5c5d111428ff7', $amount );
            
      // update the global start date
      update_field('field_5c5e1d9e3f2dd', $start_date );
      
      // if there is an amoutn owing, we stop calcuating Dream Kits
      if( $amount > 0 ) {
          break;
      }
              
    } // end while have rows
  } // end if have rows
    
} // end function

add_filter('acf/save_post', 'dream_kits_calculate_amount_owing', 20);


// Is there an active Dream Kit?
function _s_has_active_dream_kit( $post_id = false ) {
    $dream_kit = _s_get_active_dream_kit( $post_id );
    return ! empty( $dream_kit['still_needed'] ) ? true : false;
}

function _s_get_active_dream_kit( $post_id = false ) {
    
    if( empty( $post_id ) ) {
        global $post;
        $post_id = $post->ID;
    }
    
    $dream_kit = [
        'books' => [],
        'books_subtotal' => 0,
        'taxes' => 0,
        'operations' => 0,
        'total_cost' => 0,
        'donations' => [],
        'total_donations' => 0,
        'still_needed' => 0
    ];
    
    $rows = get_field( 'dream_kits', $post_id );
    
    if( ! empty( $rows ) ) {
            
        foreach( $rows as $row ) {            
                            
            /*
            - has start date
            - has an amount owing
            */
                      
            $amount_owing = $row['amount_owing'];
            $start_date   = $row['start_date'];
                                  
            if( $amount_owing && ! empty( $start_date ) ) {
                
                $books = $row['books'];
                
                if( ! empty( $books ) ) {
                    foreach( $books as $book ) {
                        $dream_kit['books'][] = $book['title'];
                        $dream_kit['books_subtotal'] += $book['price'];
                    }
                }
             
                $dream_kit['taxes'] =  $row['taxes'];
                $dream_kit['operations'] =  $row['operations'];
                
                $total_cost = $row['total_cost'];
                $dream_kit['total_cost'] =  $row['total_cost'];
                 
                $donations = $row['donations'];
                $dream_kit['donations']  =  $row['donations'];
                $total_donations = 0;
                if( ! empty( $donations ) ) {
                    
                    foreach( $donations as $donation ) {
                        $total_donations += $donation['amount'];
                    }
                    
                    $dream_kit['total_donations'] = $total_donations;
                }
                
                if( $total_cost - $total_donations > 0 ) {
                    $dream_kit['still_needed'] = $total_cost - $total_donations;
                }
                
                // We only want one
                break; 
            }
     
              
        } // end while have rows
                
    } // end if have rows
    
    return $dream_kit; 
    
} // end function


// Get the time since last dream kit ended
function _s_get_days_since_last_dream_kit( $post_id = false ) {
    
    if( empty( $post_id ) ) {
        $post_id = get_family_post_by_user_id();
    }
    
    if( empty( $post_id ) ) {
        return 0;   
    }
    
    $rows = get_field( 'dream_kits', $post_id );
    
    if( ! empty( $rows ) ) {
        
        $row = array_pop( $rows );
                    
        $end_date = $row['end_date'];
                              
        if( ! empty( $end_date ) ) {
            
            $now = current_time( 'Ymd' ); // or your date as well
            
            return $now - $end_date;
                                    
        } // end while have rows
                
    } // end if have rows
    
    return false; 
    
} // end function



function dream_kits_calculate_amount_needed( $post_id = false ) {
    
  if( ! $post_id ) {
        $post_id = get_the_ID();
  }
         
  // now we'll look at the repeater and save any values
  if ( have_rows('dream_kits', $post_id ) ) {
    while ( have_rows('dream_kits', $post_id ) ) {
      the_row();
      
      $amount = 0;
      
      $start_date = get_sub_field('start_date');
      // if missing start date we don't calculate
      if( empty( $start_date ) ) {
          continue;
      }
      
      $end_date = get_sub_field('end_date');
      // if closed we don't calculate
      if( ! empty( $end_date ) ) {
          continue;
      }
      
      $total_cost = 0;
      $donation_amounts = 0;
      
      $total_cost = get_sub_field('total_cost');
      
      if( empty( $total_cost ) ) {
          continue;
      }
            
      $donations = get_sub_field('donations');
      if( ! empty( $donations ) ) {
          foreach( $donations as $donation ) {
              $donation_amounts += $donation['amount'];
          }
      }
      
      $amount = $total_cost - $donation_amounts;
      $amount = $amount;
      $amount = number_format( $amount, 2 );

      
      // if there is an amoutn owing, we stop calcuating Dream Kits
      if( $amount > 0 ) {
          return [ 'total_cost' => $total_cost, 'still_needed' => $amount ];
      }
              
    } // end while have rows
  } // end if have rows
    
} // end function



// Single Family Helper functions

function _s_get_family_name( $post_id = false ) {
    if( empty( $post_id ) ) {
        $post_id = get_the_ID();
    }
    return get_field( 'family_name', $post_id  );   
}

function _s_get_family_bio( $excerpt = false ) {
    $field = get_field( 'editor', get_the_ID(), false );
    if( $excerpt ) {
        $field = wp_trim_words( $field, 12 );
    }
    return wpautop( $field );
}

function _s_get_family_photo() {
    $default_thumbnail = sprintf( '%sfamily/default-photo.png', trailingslashit( THEME_IMG ) );
    $thumbnail = get_field( 'photo' );
    $thumbnail = _s_get_acf_image_url( $thumbnail, 'large' );
    if( empty( $thumbnail ) ) {
        $thumbnail = $default_thumbnail;
    }
    
    $thumbnail = sprintf( 'style="background-image: url(%s);"', $thumbnail );
    
    return sprintf( '<div class="thumbnail"%s></div>', $thumbnail );
}


function _s_get_family_progress_bar() {
    
    $progress = $still_needed = '';
    
    $amounts = dream_kits_calculate_amount_needed();
    
    if( ! empty( $amounts ) ) {
        $total_cost     = $amounts['total_cost'];
        $still_needed   = $amounts['still_needed'];
        
        if( ( $total_cost - $still_needed ) >= 0 ) {
            $progress = sprintf( '<span style="width: %s"></span>', ( ( $total_cost - $still_needed ) / $total_cost ) * 100 . '%' );
            $still_needed = sprintf( '<p>$%s still needed</p>', $still_needed );
        }
    }    
    return sprintf( '<div class="progress">%s</div>%s', $progress, $still_needed ); 
}

function _s_get_family_location() {
    $city  = get_field( 'city' );
    $state = get_field( 'state' );
    return sprintf( '<p class="location">%s, %s</p>', $city, $state );
}


function _s_get_family_size() {
    $family_size  = get_field( 'family_size' );
    if( absint( $family_size ) > 0 ) {
        return sprintf( '<p class="family-size">Family Size: %s</p>', $family_size );
    }
    return false;
}



function _s_get_family_post_ids() {
    
    $today = current_time( 'Ymd' ); // local time set under Settings > General
                                
    $args = array(
        'post_type' => 'family',
        'meta_key' => 'start_date',
        'orderby' => 'meta_value_num',
        'order' => 'ASC',
        'posts_per_page' => -1
    );
                    
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
    
    $args['meta_query'] = $meta_query;
    
    $loop = new WP_Query( $args );
    
    return wp_list_pluck( $loop->posts, 'ID' );
}