<?php

add_filter('nav_menu_item_args', function ($args, $item, $depth) {
    $classes = $item->classes;
    if ( in_array('button', $classes ) ) {
        $args->link_before = '<span>';
        $args->link_after  = '</span>';
    }
    return $args;
}, 10, 3);



// Create jump links with "Link Relationship" text input as cheat
function child_enable_menu_description( $item_output, $item ) {
		
    $contains = strpos( $item->xfn, 'section' ) !== false;
            
	if ( $contains ) {
		$new_page_anchor =  sprintf( '%s#%s', trailingslashit( get_permalink( $item->object_id ) ), $item->xfn );
		return str_replace( get_permalink( $item->object_id ), $new_page_anchor, $item_output );
	}
	return $item_output;
}

add_filter( 'walker_nav_menu_start_el', 'child_enable_menu_description', 10, 2 );


// hijack the logout custom link
function _s_logout_link( $item_output, $item ) {
	if ( in_array( 'logout', $item->classes ) ) {
		$new_page_anchor =  wp_logout_url( home_url() );
		return str_replace( $item->url, $new_page_anchor, $item_output );
	}
	return $item_output;
}

add_filter( 'walker_nav_menu_start_el', '_s_logout_link', 10, 2 );


// remove parent class from homepage - used for single page scroll menus
function clear_nav_menu_item_class($classes, $item, $args) {
    
    
	if( is_front_page() && ( $args->theme_location == 'primary' ) ) {
		$classes = array_filter($classes, "remove_parent_classes");
	}
	
	return $classes;
}

add_filter('nav_menu_css_class', 'clear_nav_menu_item_class', 10, 3);


// Filter menu items as needed and set a custom class etc....
function set_current_menu_class($classes) {
	global $post;
	
	if( is_singular( 'team' ) ) {
		
		$classes = array_filter($classes, "remove_parent_classes");
		
		if ( in_array('menu-item-27', $classes ) )
			$classes[] = 'current-menu-item';
	}
			
	return $classes;
}

//add_filter('nav_menu_css_class', 'set_current_menu_class',1,2); 


// check for current page classes, return false if they exist.
function remove_parent_classes($class){
  return in_array( $class, array( 'current_page_item', 'current_page_parent', 'current_page_ancestor', 'current-menu-item' ) )  ? FALSE : TRUE;
}



function _s_is_page_template_name( $template_name ) {
	
	if( is_page() ) {
		$template_found = str_replace( '.php', '', basename( get_page_template_slug( get_queried_object_id() ) ) );
		return $template_name === $template_found ? true : false;
	}
	
}
