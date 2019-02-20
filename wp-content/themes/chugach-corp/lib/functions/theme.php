<?php
function content_span_inside_h2($content) 
{
  	$a = array('<h2>','</h2>');
	$b = array('<h2><span>','</span></h2>');
	$content = str_replace( $a, $b, $content );
  	return $content;
}
add_filter( 'the_content', 'content_span_inside_h2' );


function acf_span_inside_h2( $value, $post_id, $field ) {
	
    $a = array('<h2>','</h2>');
	$b = array('<h2><span>','</span></h2>');
	$value = str_replace( $a, $b, $value );	
	// return
	return $value;
}
add_filter('acf/format_value/type=wysiwyg', 'acf_span_inside_h2', 10, 3);


// Add modals to footer
function _s_footer() {
    _s_get_template_part( 'template-parts/modal', 'video' );   
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



// Enable the Styles dropdown menu item
// Callback function to insert 'styleselect' into the $buttons array
function my_mce_buttons_2( $buttons ) {
    array_unshift( $buttons, 'styleselect' );
    return $buttons;
}

add_filter('mce_buttons_2', 'my_mce_buttons_2');


// Add the Button CSS to the Dropdown Menu
// Callback function to filter the MCE settings
function my_mce_before_init_insert_formats( $init_array ) {

    // Define the style_formats array
    $style_formats = array(
    
    // Each array child is a format with it's own settings
    array(
        'title' => 'Button',
        'selector' => 'a',
        'classes' => 'button',
        )
    );
    
    // Insert the array, JSON ENCODED, into 'style_formats'
    $init_array['style_formats'] = json_encode( $style_formats );
    return $init_array;
}

add_filter( 'tiny_mce_before_init', 'my_mce_before_init_insert_formats' );