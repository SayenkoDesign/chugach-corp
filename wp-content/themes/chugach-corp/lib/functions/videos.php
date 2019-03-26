<?php

function _s_get_video_embed( $url ) {
    $youtube_id          = wds_check_for_youtube( $url );
	$vimeo_id            = wds_check_for_vimeo( $url );
	$video_thumbnail_url = '';
	if ( $youtube_id ) {
		$youtube_details     = wds_get_youtube_details( $youtube_id );
		$video_thumbnail_url = $youtube_details['video_thumbnail_url'];
		$video_url           = $youtube_details['video_url'];
		$video_embed_url     = $youtube_details['video_embed_url'];
        
        $params = array(
            'controls'    => 1,
            'hd'        => 1,
            'autohide'    => 1,
            'rel' => 0,
            'autoplay' => 1
        );
        
        $video_embed_url = add_query_arg($params, $video_embed_url );
	}
	if ( $vimeo_id ) {
		$vimeo_details       = wds_get_vimeo_details( $vimeo_id );
		$video_thumbnail_url = $vimeo_details['video_thumbnail_url'];
		$video_url           = $vimeo_details['video_url'];
		$video_embed_url     = $vimeo_details['video_embed_url'];
        
        $params = array(
            'autoplay' => 1,
            'allow' => 'autoplay'
        );
        
        $video_embed_url = add_query_arg($params, $video_embed_url );
	}
    
    return $video_embed_url;
}



/**
 * Check if a post contains video.  Maybe set a thumbnail, store the video URL as post meta.
 *
 * @author Gary Kovar
 *
 * @since  1.0.5
 *
 * @param int    $post_id ID of the post being saved.
 * @param object $post    Post object.
 */
function wds_check_if_content_contains_video( $post_id, $post ) {
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	// We need to prevent trying to assign when trashing or untrashing posts in the list screen.
	// get_current_screen() was not providing a unique enough value to use here.
	if ( isset( $_REQUEST['action'] ) && in_array( $_REQUEST['action'], array( 'trash', 'untrash' ) )  ) {
		return;
	}
	$content = isset( $post->post_content ) ? $post->post_content : '';
	$content_check_length = function_exists( 'the_gutenberg_project' ) ? 4000 : 800;
	/**
	 * Only check the first 800 characters of our post, by default.
	 *
	 * @since 1.0.0
	 *
	 * @param int $value Character limit to search.
	 */
	// $content = substr( $content, 0, apply_filters( 'wds_featured_images_character_limit', $content_check_length ) );
	// Allow developers to filter the content to allow for searching in postmeta or other places.
	// $content = apply_filters( 'wds_featured_images_from_video_filter_content', $content, $post_id );
	// Set the video id.
	$youtube_id          = wds_check_for_youtube( $content );
	$vimeo_id            = wds_check_for_vimeo( $content );
	$video_thumbnail_url = '';
	if ( $youtube_id ) {
		$youtube_details     = wds_get_youtube_details( $youtube_id );
		$video_thumbnail_url = $youtube_details['video_thumbnail_url'];
		$video_url           = $youtube_details['video_url'];
		$video_embed_url     = $youtube_details['video_embed_url'];
	}
	if ( $vimeo_id ) {
		$vimeo_details       = wds_get_vimeo_details( $vimeo_id );
		$video_thumbnail_url = $vimeo_details['video_thumbnail_url'];
		$video_url           = $vimeo_details['video_url'];
		$video_embed_url     = $vimeo_details['video_embed_url'];
	}
	if ( $post_id
	     && ! has_post_thumbnail( $post_id )
	     && $content
	     && ( $youtube_details || $vimeo_details )
	) {
		$video_id = '';
		if ( $youtube_id ) {
			$video_id = $youtube_id;
		}
		if ( $vimeo_id ) {
			$video_id = $vimeo_id;
		}
	}
	if ( $post_id
	     && $content
	     && ( $youtube_id || $vimeo_id )
	) {
		update_post_meta( $post_id, '_is_video', true );
		update_post_meta( $post_id, '_video_url', $video_url );
		update_post_meta( $post_id, '_video_embed_url', $video_embed_url );
	} else {
		// Need to set because we don't have one, and we can skip on future iterations.
		// Need way to potentially force check ALL.
		update_post_meta( $post_id, '_is_video', false );
		delete_post_meta( $post_id, '_video_url' );
		delete_post_meta( $post_id, '_video_embed_url' );
	}
}

// Check on save if content contains video.
add_action( 'save_post', 'wds_check_if_content_contains_video', 10, 2 );


/**
 * Check if the content contains a youtube url.
 *
 * Props to @rzen for lending his massive brain smarts to help with the regex.
 *
 * @author Gary Kovar
 *
 * @param $content
 *
 * @return string The value of the youtube id.
 *
 */
function wds_check_for_youtube( $content ) {
	if ( preg_match( '/\/\/(www\.)?(youtu|youtube)\.(com|be)\/(watch|embed)?\/?(\?v=)?([a-zA-Z0-9\-\_]+)/', $content, $youtube_matches ) ) {
		return $youtube_matches[6];
	}
	return false;
}
/**
 * Check if the content contains a vimeo url.
 *
 * Props to @rzen for lending his massive brain smarts to help with the regex.
 *
 * @author Gary Kovar
 *
 * @param $content
 *
 * @return string The value of the vimeo id.
 *
 */
function wds_check_for_vimeo( $content ) {
	if ( preg_match( '#\/\/(.+\.)?(vimeo\.com)\/(\d*)#', $content, $vimeo_matches ) ) {
		return $vimeo_matches[3];
	}
	return false;
}


/**
 * Get the image thumbnail and the video url from a youtube id.
 *
 * @author Gary Kovar
 *
 * @since 1.0.5
 *
 * @param string $youtube_id Youtube video ID.
 * @return array Video data.
 */
function wds_get_youtube_details( $youtube_id ) {
	$video = array();
	$video_thumbnail_url_string = 'http://img.youtube.com/vi/%s/%s';

	$video_check                      = wp_remote_head( 'https://www.youtube.com/oembed?format=json&url=http://www.youtube.com/watch?v=' . $youtube_id );
	if ( 200 === wp_remote_retrieve_response_code( $video_check ) ) {
		$remote_headers               = wp_remote_head(
			sprintf(
				$video_thumbnail_url_string,
				$youtube_id,
				'maxresdefault.jpg'
			)
		);
		$video['video_thumbnail_url'] = ( 404 === wp_remote_retrieve_response_code( $remote_headers ) ) ?
			sprintf(
				$video_thumbnail_url_string,
				$youtube_id,
				'hqdefault.jpg'
			) :
			sprintf(
				$video_thumbnail_url_string,
				$youtube_id,
				'maxresdefault.jpg'
			);
		$video['video_url']           = 'https://www.youtube.com/watch?v=' . $youtube_id;
		$video['video_embed_url']     = 'https://www.youtube.com/embed/' . $youtube_id;
	}

	return $video;
}

/**
 * Get the image thumbnail and the video url from a vimeo id.
 *
 * @author Gary Kovar
 *
 * @since 1.0.5
 *
 * @param string $vimeo_id Vimeo video ID.
 * @return array Video information.
 */
function wds_get_vimeo_details( $vimeo_id ) {
	$video = array();

	// @todo Get remote checking matching with wds_get_youtube_details.
	$vimeo_data = wp_remote_get( 'http://www.vimeo.com/api/v2/video/' . intval( $vimeo_id ) . '.php' );
	if ( 200 === wp_remote_retrieve_response_code( $vimeo_data ) ) {
		$response                     = unserialize( $vimeo_data['body'] );
		$video['video_thumbnail_url'] = isset( $response[0]['thumbnail_large'] ) ? $response[0]['thumbnail_large'] : false;
		$video['video_url']           = $response[0]['url'];
		$video['video_embed_url']     = 'https://player.vimeo.com/video/' . $vimeo_id;
	}

	return $video;
}