<?php

function light_gallery_query_vars_filter( $vars ) {
	$vars[] = 'gallery_cat';
	return $vars;
}
add_filter( 'query_vars', 'light_gallery_query_vars_filter' );

function light_gallery_shortcode( $atts ) {
	global $post;

	$galleries = array();
	$categories = array();

	$atts = shortcode_atts(
		array(
			'page_id' 	=> $post->ID,
			'limit'		=> 1
		),
		$atts
	);

	$page = 1;
	if ( get_query_var( 'page' ) ) {
		$page = get_query_var( 'page' );
	}

	if( have_rows( 'gallery', $atts['page_id'] ) ){
		while ( have_rows( 'gallery', $atts['page_id'] ) ){
			the_row();
			$categories[] = get_sub_field( 'category' );
			foreach( get_sub_field( 'images' ) as $image ){
				$galleries[ get_sub_field( 'category' ) ][] = $image;
			}
		}
	}

	$current_cat = $categories[0];
	if ( get_query_var( 'gallery_cat' ) ) {
		$current_cat = get_query_var( 'gallery_cat' );
	}

	$row             = 0;
	$images_per_page = $atts['limit'];
	$images          = $galleries[ $current_cat ];
	if( !empty( $images ) ){
		$total = count($images);
	}

	$pages           = ceil($total / $images_per_page);
	$min             = (($page * $images_per_page) - $images_per_page) + 1;
	$max             = ($min + $images_per_page) - 1;

	ob_start();

	if( $images ) : ?>
		<?php echo lg_category_chooser( $categories, $atts['page_id'] ); ?>

		<div id="light-gallery" class="row small-up-2 medium-up-3 large-up-4" data-page-id="<?php echo $atts['page_id']; ?>" data-limit="<?php echo $atts['limit']; ?>">
			<?php foreach( $images as $image ) : 
				$row++;
				if ($row < $min) {
					continue;
				}
		
				if ($row > $max) {
					break;
				}
			?>
				<div class="column column-block" data-src="<?php echo $image['url']; ?>" data-sub-html="<?php echo $image['title']; ?>">
					<div class="thumbnail" style="background-image: url(<?php echo $image['url']; ?>);"></div>
					<?php echo wp_get_attachment_image( $image['ID'], 'medium' ); ?>
				</div>
			<?php endforeach; ?>
		</div>

		<?php echo lg_pagination(array(
			'base' => get_permalink( $atts['page_id'] ) . '%#%' . '/',
			'format' => '?page=%#%',
			'current' => $page,
			'total' => $pages,
			'type'	=> 'list', 
			'prev_text' => '<span>Previous</span>',
			'next_text' => '<span>Next</span>'
		));
   	endif;
	return ob_get_clean();
}
add_shortcode( 'light-gallery', 'light_gallery_shortcode' );

add_action( 'wp_ajax_light_gallery', 'ajax_light_gallery' );
add_action( 'wp_ajax_nopriv_light_gallery', 'ajax_light_gallery' );
function ajax_light_gallery() {
	if( empty( $_POST['lg_page_id'] ) ){
		wp_die();
		return;
	}

    if( have_rows( 'gallery', $_POST['lg_page_id'] ) ){
		while ( have_rows( 'gallery', $_POST['lg_page_id'] ) ){
			the_row();
			$categories[] = get_sub_field( 'category' );
			foreach( get_sub_field( 'images' ) as $image ){
				$galleries[ get_sub_field( 'category' ) ][] = $image;
			}
		}
	}

	$current_cat = $categories[0];
	if ( $_POST['lg_gallery_cat'] ) {
		$current_cat = $_POST['lg_gallery_cat'];
	}

	$page = 1;
	if( !empty( $_POST['lg_page'] ) ){
		$page = $_POST['lg_page'];
	}

	$row             = 0;
	$images_per_page = $_POST['lg_limit'];
	$images          = $galleries[ $current_cat ];
	if( !empty( $images ) ){
		$total = count($images);
	}

	$pages           = ceil($total / $images_per_page);
	$min             = (($page * $images_per_page) - $images_per_page) + 1;
	$max             = ($min + $images_per_page) - 1;

	if( $images ) :
		$cat_dropdown = lg_category_chooser( $categories, $current_cat );
		ob_start(); ?>

		<div id="light-gallery" class="row small-up-2 medium-up-3 large-up-4" data-page-id="<?php echo $_POST['lg_page_id']; ?>" data-limit="<?php echo $_POST['lg_limit']; ?>">
			<?php foreach( $images as $image ) : 
				$row++;
				if ($row < $min) {
					continue;
				}
		
				if ($row > $max) {
					break;
				}
			?>
				<div class="column column-block" data-src="<?php echo $image['url']; ?>" data-sub-html="<?php echo $image['title']; ?>">
					<div class="thumbnail" style="background-image: url(<?php echo $image['url']; ?>);"></div>
					<?php echo wp_get_attachment_image( $image['ID'], 'medium' ); ?>
				</div>
			<?php endforeach; ?>
		</div>

		<?php $html = ob_get_clean();
			
		$pagination = lg_pagination(array(
			'base' => get_permalink( $_POST['lg_page_id'] ) . '%#%' . '/',
			'format' => '?page=%#%',
			'current' => $page,
			'total' => $pages,
			'type'	=> 'list', 
			'prev_text' => '<span>Previous</span>',
			'next_text' => '<span>Next</span>'
		));

		echo json_encode( array(
			'html'			=> $html, 
			'category'		=> $cat_dropdown, 
			'pagination'	=> $pagination
		) );

   	endif;
	wp_die();
}

function lg_category_chooser( $categories = array(), $current = '' ){
	$output = '';
	if( !empty( $categories ) ){
		$output .= '<select name="gallery_cat">';
      	foreach( $categories as $category ){
			$output .= '<option value="' . $category . '" ' . ( $current == $category ? 'selected' : '' )  . ' data-href="' . admin_url('admin-ajax.php') . '">' . $category . '</option>';
		}
		$output .= '</select>';
	}
	return sprintf( '<div class="column row text-right">%s</div>', $output );
}

/* Rewrite of paginate_links function */
function lg_pagination( $args = '' ) {
	global $wp_query, $wp_rewrite;
	// Setting up default values based on the current URL.
	$pagenum_link = html_entity_decode( get_pagenum_link() );
	$url_parts    = explode( '?', $pagenum_link );
	// Get max pages and current page out of the current query, if available.
	$total   = isset( $wp_query->max_num_pages ) ? $wp_query->max_num_pages : 1;
	$current = get_query_var( 'paged' ) ? intval( get_query_var( 'paged' ) ) : 1;
	// Append the format placeholder to the base URL.
	$pagenum_link = trailingslashit( $url_parts[0] ) . '%_%';
	// URL base depends on permalink settings.
	$format  = $wp_rewrite->using_index_permalinks() && ! strpos( $pagenum_link, 'index.php' ) ? 'index.php/' : '';
	$format .= $wp_rewrite->using_permalinks() ? user_trailingslashit( $wp_rewrite->pagination_base . '/%#%', 'paged' ) : '?paged=%#%';
	$defaults = array(
		'base'               => $pagenum_link, // http://example.com/all_posts.php%_% : %_% is replaced by format (below)
		'format'             => $format, // ?page=%#% : %#% is replaced by the page number
		'total'              => $total,
		'current'            => $current,
		'aria_current'       => 'page',
		'show_all'           => false,
		'prev_next'          => true,
		'prev_text'          => __( '&laquo; Previous' ),
		'next_text'          => __( 'Next &raquo;' ),
		'end_size'           => 1,
		'mid_size'           => 2,
		'type'               => 'plain',
		'add_args'           => array(), // array of query args to add
		'add_fragment'       => '',
		'before_page_number' => '',
		'after_page_number'  => '',
	);
	$args = wp_parse_args( $args, $defaults );
	if ( ! is_array( $args['add_args'] ) ) {
		$args['add_args'] = array();
	}
	// Merge additional query vars found in the original URL into 'add_args' array.
	if ( isset( $url_parts[1] ) ) {
		// Find the format argument.
		$format       = explode( '?', str_replace( '%_%', $args['format'], $args['base'] ) );
		$format_query = isset( $format[1] ) ? $format[1] : '';
		wp_parse_str( $format_query, $format_args );
		// Find the query args of the requested URL.
		wp_parse_str( $url_parts[1], $url_query_args );
		// Remove the format argument from the array of query arguments, to avoid overwriting custom format.
		foreach ( $format_args as $format_arg => $format_arg_value ) {
			unset( $url_query_args[ $format_arg ] );
		}
		$args['add_args'] = array_merge( $args['add_args'], urlencode_deep( $url_query_args ) );
	}
	// Who knows what else people pass in $args
	$total = (int) $args['total'];
	if ( $total < 2 ) {
		return;
	}
	$current  = (int) $args['current'];
	$end_size = (int) $args['end_size']; // Out of bounds?  Make it the default.
	if ( $end_size < 1 ) {
		$end_size = 1;
	}
	$mid_size = (int) $args['mid_size'];
	if ( $mid_size < 0 ) {
		$mid_size = 2;
	}
	$add_args   = $args['add_args'];
	$r          = '';
	$page_links = array();
	$dots       = false;
	if ( $args['prev_next'] && $current && 1 < $current ) :
		$link = str_replace( '%_%', 2 == $current ? '' : $args['format'], $args['base'] );
		$link = str_replace( '%#%', $current - 1, $link );
		if ( $add_args ) {
			$link = add_query_arg( $add_args, $link );
		}
		$link .= $args['add_fragment'];
		/**
		 * Filters the paginated links for the given archive pages.
		 *
		 * @since 3.0.0
		 *
		 * @param string $link The paginated link URL.
		 */
		$page_links[] = '<li class="nav-previous"><a class="prev page-numbers" href="' . esc_url( apply_filters( 'paginate_links', $link ) ) . '" data-href="' . admin_url( 'admin-ajax.php' ) . '" data-page="' .number_format_i18n(  $current - 1 ) . '">' . $args['prev_text'] . '</a></li>';
    else :
        $page_links[] = '<li class="nav-previous"><a class="disable"><span>Previous</span></a></li>';
	endif;
	for ( $n = 1; $n <= $total; $n++ ) :
		if ( $n == $current ) :
			$page_links[] = "<li class='number'><span aria-current='" . esc_attr( $args['aria_current'] ) . "' class='page-numbers current'>" . $args['before_page_number'] . number_format_i18n( $n ) . $args['after_page_number'] . '</span></li>';
			$dots         = true;
		else :
			if ( $args['show_all'] || ( $n <= $end_size || ( $current && $n >= $current - $mid_size && $n <= $current + $mid_size ) || $n > $total - $end_size ) ) :
				$link = str_replace( '%_%', 1 == $n ? '' : $args['format'], $args['base'] );
				$link = str_replace( '%#%', $n, $link );
				if ( $add_args ) {
					$link = add_query_arg( $add_args, $link );
				}
				$link .= $args['add_fragment'];
				/** This filter is documented in wp-includes/general-template.php */
				$page_links[] = "<li class='number'><a class='page-numbers' href='" . esc_url( apply_filters( 'paginate_links', $link ) ) . "' data-href='" . admin_url( 'admin-ajax.php' ) . "' data-page='" . number_format_i18n( $n ) . "'>" . $args['before_page_number'] . number_format_i18n( $n ) . $args['after_page_number'] . '</a></li>';
				$dots         = true;
			elseif ( $dots && ! $args['show_all'] ) :
				$page_links[] = '<li class="number"><span class="page-numbers dots">' . __( '&hellip;' ) . '</span></li>';
				$dots         = false;
			endif;
		endif;
	endfor;
	if ( $args['prev_next'] && $current && $current < $total ) :
		$link = str_replace( '%_%', $args['format'], $args['base'] );
		$link = str_replace( '%#%', $current + 1, $link );
		if ( $add_args ) {
			$link = add_query_arg( $add_args, $link );
		}
		$link .= $args['add_fragment'];
		/** This filter is documented in wp-includes/general-template.php */
		$page_links[] = '<li class="nav-next"><a class="next page-numbers" href="' . esc_url( apply_filters( 'paginate_links', $link ) ) . '" data-href="' . admin_url( 'admin-ajax.php' ) . '" data-page="' .number_format_i18n(  $current + 1 ) . '">' . $args['next_text'] . '</a></li>';
    else :
        $page_links[] = '<li class="nav-next"><a class="disable"><span>Next</span></a></li>';
	endif;
	
	$r .= "<div class='column row'><div class='gallery-pagination'><ul class='nav-links'>";
	$r .= join( "\n\t", $page_links );
	$r .= "</ul></div></div>";
	return $r;
}