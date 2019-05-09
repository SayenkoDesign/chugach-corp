<?php

// Get related ppsts by category query
function _s_get_related_posts_query_args( $post_id = false, $related_count = 12, $args = array() ) {
	
    $terms = get_the_terms( $post_id, 'category' );
	
	if ( empty( $terms ) || is_wp_error( $terms ) ) return;
	
	$term_list = wp_list_pluck( $terms, 'slug' );
	
	$default_args = array(
		'post_type' => 'post',
		'posts_per_page' => $related_count,
		'post_status' => 'publish',
		'post__not_in' => array( $post_id ),
		'orderby' => 'rand',
		'tax_query' => array(
			array(
				'taxonomy' => 'category',
				'field' => 'slug',
				'terms' => $term_list
			)
		)
	);
    
    $args = wp_parse_args( $args, $default_args );

	return new WP_Query( $args );
}
