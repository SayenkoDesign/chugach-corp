<?php



// Add modals to footer
function _s_footer() {
    _s_get_template_part( 'template-parts/modal', 'story' );   
    _s_get_template_part( 'template-parts/modal', 'video' );   
    _s_get_template_part( 'template-parts/modal', 'search' );  
}
add_action( 'wp_footer', '_s_footer' );

/*
 * Modify TinyMCE editor to remove H1.
 */
function tiny_mce_remove_unused_formats($init) {
	// Add block format elements you want to show in dropdown
	$init['block_formats'] = 'Paragraph=p;Heading 2=h2;Heading 3=h3;';
	return $init;
}

add_filter('tiny_mce_before_init', 'tiny_mce_remove_unused_formats' );

// Exclude page templates from being used more than once.
function _s_remove_page_template( $pages_templates ) {
    
    // List of templates that can be used more than once
    $excludes = [ 'page-templates/page-builder.php', 'page-templates/pagebuilder.php', 'page-templates/redirect.php' ];


    // Don't touch anyhting below
    
    
    global $post;
    
    // Bail if not a page edit screen
    if( 'page' != get_post_type( $post ) ) {
        return $pages_templates;
    }
    
    // Get list of templates
    $templates = get_meta_values( '_wp_page_template', 'page' ); 
    
    // Bail if no templates set
    if( empty( $templates ) ) {
        return $pages_templates;
    }
            
    if( ! empty( $excludes ) ) {
        foreach( $excludes as $exclude ) {
            $templates = array_diff($templates,array($exclude));
        }
    }
    
    foreach( $templates as $template ) {
        if( $template != get_page_template_slug( $post->ID ) ) {
            unset( $pages_templates[$template] );
        }
    }
           
    return $pages_templates;
}

add_filter( 'theme_page_templates', '_s_remove_page_template', 20 );
