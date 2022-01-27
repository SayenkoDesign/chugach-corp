<?php

// index attachments
/*
add_filter( 'facetwp_indexer_query_args', function( $args ) {
    $args['post_status'] = array( 'publish', 'inherit' );
    return $args;
});
*/

// Run the facet index on save_post

add_action( 'save_post', '_s_facet_index_post', 10, 3 );

/* When a specific post type's post is saved, saves our custom data
 * @param int     $post_ID Post ID.
 * @param WP_Post $post    Post object.
 * @param bool    $update  Whether this is an existing post being updated or not.
*/
function _s_facet_index_post( $post_id, $post, $update ) {
  // verify if this is an auto save routine. 
  // If it is our form has not been submitted, so we dont want to do anything
  if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) 
      return;
      
  if( ! class_exists( 'FacetWP' ) ) {
      return;
  }

  FWP()->indexer->index();
  
}

function my_facetwp_pager_html( $output, $params ) {
    $output = '<ul class="nav-links">';
    $page = (int) $params['page'];
    $total_pages = (int) $params['total_pages'];
 
    // Only show pagination when > 1 page
    if ( 1 < $total_pages ) {
 
        if ( 1 < $page ) {
            $output .= sprintf( '<li class="nav-previous"><a class="facetwp-page" data-page="%s"><span>&laquo; %s</span></a></li>',
                                ( $page - 1 ), __( 'Previous Page' ) );
        }
        else {
             $output .= sprintf( '<li class="nav-previous"><a class="disable"><span>&laquo; %s</span></a></li>',
             __( 'Previous Page' ) );
        }
        
        if ( 3 < $page ) {
            $output .= '<li><a class="facetwp-page first-page" data-page="1">1</a></li>';
            $output .= ' <span class="dots">…</span> ';
        }
        for ( $i = 2; $i > 0; $i-- ) {
            if ( 0 < ( $page - $i ) ) {
                $output .= '<li class="number"><a class="facetwp-page" data-page="' . ($page - $i) . '">' . ($page - $i) . '</a></li>';
            }
        }
 
        // Current page
        $output .= '<li class="number active" aria-label="Current page"><a class="facetwp-page active" data-page="' . $page . '">' . $page . '</a></li>';
 
        for ( $i = 1; $i <= 2; $i++ ) {
            if ( $total_pages >= ( $page + $i ) ) {
                $output .= '<li class="number"><a class="facetwp-page" data-page="' . ($page + $i) . '">' . ($page + $i) . '</a></li>';
            }
        }
        if ( $total_pages > ( $page + 2 ) ) {
            $output .= ' <span class="dots">…</span> ';
            $output .= '<li class="number"><a class="facetwp-page last-page" data-page="' . $total_pages . '">' . $total_pages . '</a></li>';
        }
        
        if ( $page < $total_pages ) {
            $output .= sprintf( '<li class="nav-next"><a class="facetwp-page" data-page="%s"><span>%s &raquo;</span></a></li>',
            ( $page + 1 ), __( 'Next Page' ) );
        }
        else {
             $output .= sprintf( '<li class="nav-next"><a class="disable"><span>%s &raquo;</span></a></li>', 
             __( 'Next Page' ) );
        }
    }
 
    $output .= '</ul>';
 
    return $output;
}

add_filter( 'facetwp_pager_html', 'my_facetwp_pager_html', 10, 2 );


// Add to functions.php
// Replace FIRST, MIDDLE, LAST with the actual field names
// https://gist.github.com/mgibbs189/0161e2f7cce5587020e7
function fwp_combine_sources( $params, $class ) {
    if ( 'job_location' == $params['facet_name'] ) {
        $job_location = get_field( 'city', $params['post_id'] ) . ', ' . get_field( 'state_code', $params['post_id'] ) . ', ' . get_field( 'country', $params['post_id'] );
        $params['facet_value'] = sanitize_title( $job_location ); // URL-safe string
        $params['facet_display_value'] = $job_location;
        // error_log( $params['post_id'] . ' ' . get_field( 'city', $params['post_id'] ) );
    }
    return $params;
}
add_filter( 'facetwp_index_row', 'fwp_combine_sources', 10, 2 );


// https://gist.github.com/mgibbs189/9705b96626cbc7893a49f643c26699aa
/* add_filter( 'facetwp_facet_filter_posts', function( $result, $params ) {
    if ( 'job_sort' == $params['facet']['name'] ) {
        return 'continue'; // prevent this facet from being processed
    }
    return $result;
}, 10, 2 );
 */

add_filter('facetwp_facet_html', function ($output, $params) {
    if ('dropdown' == $params['facet']['type']) {
      $output = preg_replace("/( \([0-9]+\))/m", '', $output);
    }
    return $output;
  }, 10, 2);



  add_filter( 'facetwp_sort_options', function( $options, $params ) {
    $options['date_desc'] = [
        'label' => __( 'Date (Newest)', 'fwp' ),
        'query_args' => [
            'meta_key' => 'posted_date',
            'orderby' => 'meta_value_num',
            'order' => 'DESC',
        ]
    ];

    $options['date_asc'] = [
        'label' => __( 'Date (Oldest)', 'fwp' ),
        'query_args' => [
            'meta_key' => 'posted_date',
            'orderby' => 'meta_value_num',
            'order' => 'ASC',
        ]
    ];
    return $options;
}, 10, 2 );