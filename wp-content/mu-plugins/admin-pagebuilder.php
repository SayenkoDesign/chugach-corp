<?php

/*
Plugin Name: Pagebuilder Admin Code
Plugin URI: http://markmercier.com
Description: Backend Styles & Scripts
Author: Sayenko Design
Version: 1.0
Author URI: http://sayenkodesign.com
*/

function _s_admin_pagebuilder_styles() {
    wp_enqueue_style('admin-styles-mu', plugins_url('admin-pagebuilder/admin.css', __FILE__));
    wp_enqueue_script('admin-scripts-mu', plugins_url('admin-pagebuilder/admin.js', __FILE__), ['jquery'], null, true);
}
add_action('admin_enqueue_scripts', '_s_admin_pagebuilder_styles');
add_action('login_enqueue_scripts', '_s_admin_pagebuilder_styles');

?>
