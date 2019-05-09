<?php
/*
add_filter( '404_template', function( $template ) 
{
    $page = get_field( 'page_404', 'option' );
    if( empty( $page ) ) {
        return $template;
    }

    // Try to locate our custom 404-event.php template    
    $new_404_template = locate_template( [ '404-custom.php'] );

    // Override if it was found    
    if( $new_404_template )
        $template = $new_404_template;

    return $template;
} );


function _s_404_add_post_state( $post_states, $post ) {
	$page = get_field( 'page_404', 'option' );
    if( empty( $page ) ) {
        return $post_states;
    }
    if( $page == $post->ID ) {
		$post_states[] = '404 Page';
	}
	return $post_states;
}
add_filter( 'display_post_states', '_s_404_add_post_state', 10, 2 );
*/