<?php
function mm_wp_query_modify( $query ) {

    /* don't do on back-end */
    if(is_admin()) { return; }

    /* don't do it unless the main query */
    /* avoids breaking menus & other queries */
    if(!$query->is_main_query()) { return; }

    if(!is_page() || get_page_template_slug() !== 'page-templates/pagebuilder.php') {
        return;
    }

    $query->set('posts_per_page', 999);

}
add_filter( 'pre_get_posts', 'mm_wp_query_modify' );
