<?php

$sibling_ids = [];

$parent_id = wp_get_post_parent_id( get_the_ID() );

if ( 'page-templates/business-lines.php' === get_page_template_slug( $parent_id ) ) {
	$siblings = get_pages( [ 'parent' => $parent_id, 'sort_column' => 'menu_order' ] );

	$sibling_ids = array_map( function ( $sibling ) {
		return $sibling->ID;
	}, $siblings );

	$curr_index = array_search( get_the_ID(), $sibling_ids );
	$next_index = ( $curr_index + 1 ) % count( $sibling_ids );
	$prev_index = ( $curr_index + count( $sibling_ids ) - 1 ) % count( $sibling_ids );
   
    $prev_link = $next_link = '';
    
    if( is_int( $prev_index ) ) {
        $prev_link = sprintf( '<div class="column column-block"><a href="%s">%s</a></div>', 
                               get_the_permalink( $siblings[ $prev_index ] ), get_the_title( $siblings[ $prev_index ] ) );
    }
    
    if( is_int( $next_index ) ) {
        $next_link = sprintf( '<div class="column column-block"><a href="%s">%s</a></div>', 
                               get_the_permalink( $siblings[ $next_index ] ), get_the_title( $siblings[ $next_index ] ) );
    }
    
    printf( '<nav class="portfolio-pagination"><div class="row small-up-2 portfolio-menu">%s%s</div></nav>', $prev_link, $next_link );
}