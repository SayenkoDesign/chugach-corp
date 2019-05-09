<?php
if( false == WP_DEBUG ) {
    //add_filter('acf/settings/show_admin', '__return_false');   
}



function my_acf_init() {
	
	acf_update_setting('google_api_key', GOOGLE_API_KEY );
}

add_action('acf/init', 'my_acf_init');

/**
*  Creates ACF Options Page(s)
*/

if( function_exists('acf_add_options_sub_page') ) {

	acf_add_options_page(array(
		'page_title' 	=> 'Theme Settings',
		'menu_title' 	=> 'Theme Settings',
		'menu_slug' 	=> 'theme-settings',
		'capability' 	=> 'edit_posts',
 		'redirect' 	=> true
	));
    
    acf_add_options_sub_page(array(
		'page_title' 	=> 'Social',
		'menu_title' 	=> 'Social',
        'menu_slug' 	=> 'theme-settings-social',
        'parent' 		=> 'theme-settings',
		'capability' => 'edit_posts',
 		'redirect' 	=> false,
        'autoload' => true,
	));
        
    acf_add_options_sub_page(array(
		'page_title' 	=> 'Footer CTA',
		'menu_title' 	=> 'Footer CTA',
        'menu_slug' 	=> 'theme-settings-footer-cta',
        'parent' 		=> 'theme-settings',
		'capability' => 'edit_posts',
 		'redirect' 	=> false,
        'autoload' => true,
	));
    
    acf_add_options_sub_page(array(
		'page_title' 	=> '404 Page',
		'menu_title' 	=> '404 Page',
        'menu_slug' 	=> 'theme-settings-404',
        'parent' 		=> 'theme-settings',
		'capability' => 'edit_posts',
 		'redirect' 	=> false,
        'autoload' => true,
	));
    
    acf_add_options_sub_page(array(
		'page_title' 	=> 'Stories',
		'menu_title' 	=> 'Stories',
        'menu_slug' 	=> 'theme-settings-stories',
        'parent' 		=> 'theme-settings',
		'capability' => 'edit_posts',
 		'redirect' 	=> false,
        'autoload' => true,
	));
    
    /*
    acf_add_options_sub_page(array(
		'page_title' 	=> 'Books Settings',
		'menu_title' 	=> 'Books Settings',
		'parent'     => 'edit.php?post_type=book',
		'capability' => 'edit_posts'
	));
    */
    

}


function _s_get_acf_options() {
    
    $all_options = wp_load_alloptions();
    $acf_options  = array();
     
    foreach ( $all_options as $name => $value ) {
        if ( substr( $name, 0, 8 ) === "options_" ) {
            $name = str_replace( 'options_', '', $name );
            $acf_options[ $name ] = $value;
        }
    }
        
    return $acf_options;
   
}


function _s_get_acf_option( $name = '' ) {
    
    $acf_options = _s_get_acf_options();
    
    if( isset( $acf_options[$name] ) && !empty( $acf_options[$name] ) ) {
        return $acf_options[$name];
    }
    
    return false;
}


function _s_get_acf_image( $attachment_id = false, $size = 'large', $background = false, $attr = array() ) {

	if( ! absint( $attachment_id ) )
		return FALSE;

	if( wp_is_mobile() ) {
 		$size = 'large';
	}

	if( $background ) {
		$background = wp_get_attachment_image_src( $attachment_id, $size );
		return $background[0];
	}

	return wp_get_attachment_image( $attachment_id, $size, '', $attr );

}


function _s_get_acf_image_url( $attachment_id = false, $size = 'large' ) {

	return _s_get_acf_image( $attachment_id, $size = 'large', true );

}


function _s_get_acf_link( $link, $args = [] ) {
    if( ! is_array( $link ) ) {
        $link = [ 'url' => $link ];
    }
    
    $link = wp_parse_args( $link, $args );
    
    if( empty( $link['title'] ) ) {
        return false;
    }
    
    return sprintf( '<a href="%s">%s</a>', $link['url'], $link['title'] );
}


function _s_get_acf_oembed( $iframe ) {


	// use preg_match to find iframe src
	preg_match('/src="(.+?)"/', $iframe, $matches);
	$src = $matches[1];


	// add extra params to iframe src
	$params = array(
		'controls'    => 1,
		'hd'        => 1,
		'autohide'    => 1,
		'rel' => 0
	);

	$new_src = add_query_arg($params, $src);

	$iframe = str_replace($src, $new_src, $iframe);


	// add extra attributes to iframe html
	$attributes = 'frameborder="0"';

	$iframe = str_replace('></iframe>', ' ' . $attributes . '></iframe>', $iframe);

	$iframe = sprintf( '<div class="embed-container">%s</div>', $iframe );


	// echo $iframe
	return $iframe;
}



// filter for a specific field based on it's name
add_filter('acf/fields/relationship/query/name=related_posts', 'my_relationship_query', 10, 3);
function my_relationship_query( $args, $field, $post_id ) {
	
    // exclude current post from being selected
    $args['exclude'] = $post_id;
	
	
	// return
    return $args;
    
}



function alter_specific_user_field( $result, $user, $field, $post_id ) {

    $result = $user->user_email;

    if( $user->first_name ) {
        
        $result .= ' (' .  $user->first_name;
        
        if( $user->last_name ) {
            
            $result .= ' ' . $user->last_name;
            
        }
        
        $result .= ')';
    }

    return $result;
}
// add_filter("acf/fields/user/result", 'alter_specific_user_field', 10, 4);


// Get Remote posts
function acf_load_rss_featured_post_field_choices( $field ) {
    
    // reset choices
    $field['choices'] = array();
    
    $rows = _acf_reset_rss_data_featured();	

	if( empty( $rows ) ) {
		return;
	}
    
    foreach( $rows as $row ) {
        $field['choices'][ $row->id ] = $row->title->rendered;
    }
    
    // return the field
    return $field;
    
}

add_filter('acf/load_field/name=rss_featured_post', 'acf_load_rss_featured_post_field_choices');




function acf_load_rss_categories_field_choices( $field ) {
    
    // reset choices
    $field['choices'] = array();
    
    $rows = _acf_reset_rss_data_categories();

	if( empty( $rows ) ) {
		return;
	}
    
    foreach( $rows as $row ) {
        $field['choices'][ $row->id ] = $row->name;
    }
    
    // return the field
    return $field;
    
}

add_filter('acf/load_field/name=rss_category', 'acf_load_rss_categories_field_choices');





function _acf_reset_rss_data_featured()  {
    
    if( is_admin() ) {
        delete_transient( 'rss_featured_posts' );
    }
    
    if ( false === ( $rows = get_transient( 'rss_featured_posts' ) ) ) :
    
        $url      = CHUGACH_COMMUNITY_BLOG_URL;
        $per_page = 50;
        $defaults = [ 'per_page' => $per_page, 'categories' => 18 ]; // 'cat' => 18, 
        
        $remote_url = sprintf( '%swp-json/wp/v2/posts', $url );    
        $remote_url = add_query_arg( $defaults, $remote_url );  
        
        $response = wp_remote_get( $remote_url );
        
        if( is_wp_error( $response ) ) {
            return;
        }
        
        $headers = $response['headers'];
        
        $total_posts = $headers['x-wp-total'];
        $total_pages = $headers['x-wp-totalpages'];
            
        $rows = [];
        
        // Are there more than $per_page posts?
        
        if( $total_posts > $per_page ) {
            
            $args = wp_parse_args( [ 'per_page' => '' ], $defaults );
            
            $page = 1;
            
            while( $page <= $total_pages ) {
                $args = [ 'page' => $page ];
                $remote_url = add_query_arg( $args, $remote_url );  
                $response = wp_remote_get( $remote_url );
                if( is_wp_error( $response ) ) {
                    break;
                }
                
                $posts = json_decode( wp_remote_retrieve_body( $response ) ); 
                $rows = array_merge_recursive($rows, $posts );
                $page++;
            }
            
            
        } else {
           $rows = json_decode( wp_remote_retrieve_body( $response ) );   
        }
        
        set_transient( 'rss_featured_posts', $rows, 1 * HOUR_IN_SECONDS );
    
    endif;
    
    return $rows;
    
}

add_action( 'load-post.php', '_acf_reset_rss_data_featured' );



function _acf_reset_rss_data_categories()  {
    
    if( is_admin() ) {
        delete_transient( 'rss_categories' );
    }
    
    if ( false === ( $rss_categories = get_transient( 'rss_categories' ) ) ) :
    
        $remote_url = CHUGACH_COMMUNITY_BLOG_URL;
    
        $response = wp_remote_get( sprintf( '%swp-json/wp/v2/categories', $remote_url ) );
    
        if( is_wp_error( $response ) ) {
            return;
        }
    
        $rss_categories = json_decode( wp_remote_retrieve_body( $response ) );
        
        set_transient( 'rss_categories', $rss_categories, 24 * HOUR_IN_SECONDS );
    
    endif;
    
    return $rss_categories;
    
}

add_action( 'load-post.php', '_acf_reset_rss_data_categories' );

https://community.chugach.com/wp-json/wp/v2/categories


function _s_disable_rss_category_link_field($field) {
	$field['disabled'] = 1;
    $field['readonly'] = 1;
	return $field;
}

add_filter('acf/load_field/key=field_5c8c059fb9d35', '_s_disable_rss_category_link_field');


function _s_update_rss_categories_link( $post_id ) {
        
    $url = '';
    
    $remote_url = CHUGACH_COMMUNITY_BLOG_URL;
    
    $cat = get_field( 'rss_category', $post_id );
        
    if( empty( $cat ) ) {
        $url = $remote_url;
    } else {
        $response = wp_remote_get( sprintf( '%swp-json/wp/v2/categories/%s', $remote_url, $cat ) );
        
        if( ! is_wp_error( $response ) ) {
            $rss_categories = json_decode( wp_remote_retrieve_body( $response ) );
            if( ! empty( $rss_categories->link ) ) {
                $url = $rss_categories->link;
            }
        } else {
            $url = $remote_url;
        }
    }
        
    update_field('field_5c8c059fb9d35', $url );   
}

add_filter('acf/save_post', '_s_update_rss_categories_link', 20);
