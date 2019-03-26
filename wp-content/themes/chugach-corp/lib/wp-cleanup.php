<?php
/**
 * WordPress Core tweaks - this is a work in progress
 *
 * These should be removed and adjusted as necessary.
 *
 * @since    1.0.0
 */
 
// Clean up Head
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'wp_shortlink_wp_head' );

// REMOVE WP EMOJI
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('wp_print_styles', 'print_emoji_styles');

remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
remove_action( 'admin_print_styles', 'print_emoji_styles' );

// Execute shortcodes in widgets
add_filter( 'widget_text', 'do_shortcode' );

// unregister all widgets
add_action('widgets_init', 'remove_default_widgets', 11);

function remove_default_widgets() {
     unregister_widget('WP_Widget_Pages');
     unregister_widget('WP_Widget_Calendar');
     //unregister_widget('WP_Widget_Archives');
     unregister_widget('WP_Widget_Links');
     unregister_widget('WP_Widget_Meta');
     //unregister_widget('WP_Widget_Search');
     //unregister_widget('WP_Widget_Text');
     //unregister_widget('WP_Widget_Categories');
     unregister_widget('WP_Widget_Recent_Posts');
     unregister_widget('WP_Widget_Recent_Comments');
     unregister_widget('WP_Widget_RSS');
     unregister_widget('WP_Widget_Tag_Cloud');
    // unregister_widget('WP_Nav_Menu_Widget');
}

// Remove Dashboard Meta Boxes
add_action( 'wp_dashboard_setup', 'mb_remove_dashboard_widgets' );
function mb_remove_dashboard_widgets() {
	global $wp_meta_boxes;
	unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_quick_press']);
	unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_incoming_links']);
	// unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_right_now']);
	unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_plugins']);
	// unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_recent_drafts']);
	// unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_recent_comments']);
	unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_primary']);
	unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_secondary']);
}


// Remove default link for images
add_action( 'admin_init', 'mb_imagelink_setup', 10 );
function mb_imagelink_setup() {
	$image_set = get_option( 'image_default_link_type' );
	if ($image_set !== 'none') {
		update_option( 'image_default_link_type', 'none' );
	}
}

// Remove paragrapgh tags around images
add_filter('the_content', 'filter_ptags_on_images', 999 );
function filter_ptags_on_images($content){
   return preg_replace('/<p>\s*(<a .*>)?\s*(<img .* \/>)\s*(<\/a>)?\s*<\/p>/iU', '\1\2\3', $content);
}

// Show Kitchen Sink in WYSIWYG Editor
add_filter( 'tiny_mce_before_init', 'mb_unhide_kitchensink' );
function mb_unhide_kitchensink( $args ) {
	$args['wordpress_adv_hidden'] = false;
	return $args;
}

// Remove Query Strings From Static Resources
//add_filter( 'script_loader_src', 'mb_remove_script_version', 15, 1 );
//add_filter( 'style_loader_src', 'mb_remove_script_version', 15, 1 );
function mb_remove_script_version( $src ){
	$parts = explode( '?ver', $src );
	return $parts[0];
}

// Remove Read More Jump
add_filter( 'the_content_more_link', 'mb_remove_more_jump_link' );
function mb_remove_more_jump_link( $link ) {
	$offset = strpos( $link, '#more-' );
	if ($offset) {
		$end = strpos( $link, '"',$offset );
	}
	if ($end) {
		$link = substr_replace( $link, '', $offset, $end-$offset );
	}
	return $link;
}


// Filter Yoast SEO Metabox Priority
add_filter( 'wpseo_metabox_prio', 'mb_filter_yoast_seo_metabox' );
function mb_filter_yoast_seo_metabox() {
	return 'low';
}

// Disable WPSEO Nag on Dev Server 
//add_filter( 'option_wpseo', 'be_disable_wpseo_nag' );
function be_disable_wpseo_nag( $options ) {
	if( strpos( site_url(), 'localhost' ) || strpos( site_url() ,'master-wp' ) )
		$options['ignore_blog_public_warning'] = 'ignore';
	return $options;
}

//Page Slug Body Class
add_filter( 'body_class', 'add_slug_body_class', 10, 2 );
function add_slug_body_class( $wp_classes, $extra_classes ) {
	
	global $post;

    // add a class for the name of the page - later might want to remove the auto generated pageid class which isn't very useful
    if( is_page()) {
        $pn = $post->post_name;
        $extra_classes[] = "page-".$pn;
    }

    // add a class for the parent page name
    if ( is_page() && $post->post_parent ) {
        $post_parent = get_post($post->post_parent);
        $parentSlug = $post_parent->post_name;
        $extra_classes[] = "parent-".$parentSlug;
    }
    
     // add class for the name of the custom template used (if any)
    $temp = get_page_template();
    if ( $temp != null ) {
        $path = pathinfo($temp);
        $tmp = $path['filename'] . "." . $path['extension'];
        $tn= str_replace(".php", "", $tmp);
        $extra_classes[] = "template-".$tn;
    }	
    
    // remove default page template name from front-page.php
    if( is_front_page() || is_home() ) {
         unset( $wp_classes['page-template-default'] );
    }	
    	
	// Add the extra classes back untouched
    return array_merge( $wp_classes, (array) $extra_classes );
}

/**
 * Modifies the TinyMCE settings array
 */
add_filter( 'tiny_mce_before_init', 'ssm_tiny_mce_before_init' );
function ssm_tiny_mce_before_init( $init ) {

	// Restrict the Formats available in TinyMCE. Currently excluded: h1,h5,h6,address,pre
	$init['block_formats'] = 'Paragraph=p;Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Blockquote=blockquote';
	return $init;

}

/**
 * Remove the injected styles for the [gallery] shortcode
 *
 */
add_filter( 'gallery_style', 'ssm_gallery_style' );
function ssm_gallery_style( $css ) {

	return preg_replace( "!<style type='text/css'>(.*?)</style>!s", '', $css );

}

/**
 * Fix Gravity Form Tabindex Conflicts
 * http://gravitywiz.com/fix-gravity-form-tabindex-conflicts/
 */
add_filter( 'gform_tabindex', 'gform_tabindexer', 10, 2 );
function gform_tabindexer( $tab_index, $form = false ) {
    $starting_index = 1000; // if you need a higher tabindex, update this number
    if( $form )
        add_filter( 'gform_tabindex_' . $form['id'], 'gform_tabindexer' );
    return GFCommon::$tab_index >= $starting_index ? GFCommon::$tab_index : $starting_index;
}


// fix menu always showing blog as parent
function dtbaker_wp_nav_menu_objects($sorted_menu_items, $args){
    // check if the current page is really a blog post.
    global $wp_query;
    global $post;
    $current_page = $post;
    if(!empty($wp_query->queried_object_id)){
        if($current_page && $current_page->post_type=='post'){
            //yes!
        }else{
            $current_page = false;
        }
    }else{
        $current_page = false;
    }
 
    $home_page_id = (int) get_option( 'page_for_posts' );
    foreach($sorted_menu_items as $id => $menu_item){
        if ( ! empty( $home_page_id ) && 'post_type' == $menu_item->type && empty( $wp_query->is_page ) && $home_page_id == $menu_item->object_id ){
            if(!$current_page){
                foreach($sorted_menu_items[$id]->classes as $classid=>$classname){
                    if($classname=='current_page_parent'){
                        unset($sorted_menu_items[$id]->classes[$classid]);
                    }
                }
            }
        }
    }
    return $sorted_menu_items;
}
add_filter('wp_nav_menu_objects','dtbaker_wp_nav_menu_objects',10,2);



/**
 * Removes the width and height attributes of <img> tags for SVG
 * 
 * Without this filter, the width and height are set to "1" since
 * WordPress core can't seem to figure out an SVG file's dimensions.
 * 
 * For SVG:s, returns an array with file url, width and height set 
 * to null, and false for 'is_intermediate'.
 * 
 * @wp-hook image_downsize
 * @param mixed $out Value to be filtered
 * @param int $id Attachment ID for image.
 * @return bool|array False if not in admin or not SVG. Array otherwise.
 */
function wpse240579_fix_svg_size_attributes( $out, $id ) {
    $image_url  = wp_get_attachment_url( $id );
    $file_ext   = pathinfo( $image_url, PATHINFO_EXTENSION );

    if ( is_admin() || 'svg' !== $file_ext ) {
        return false;
    }

    return array( $image_url, null, null, false );
}
add_filter( 'image_downsize', 'wpse240579_fix_svg_size_attributes', 10, 2 ); 