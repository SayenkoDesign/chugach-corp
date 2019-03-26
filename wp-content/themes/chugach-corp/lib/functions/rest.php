<?php
/*
To Do cache posts, and refresh on save
*/

class Chugach_Rest_API_Posts {
    
    private $url = CHUGACH_COMMUNITY_BLOG_URL;
    private $endpoint = 'wp-json/wp/v2';
    private $per_page = 12;
    private $page = 1;
    
    public function __construct( $url = false ) {
        
        $this->set_url( $url );
        
        if( empty( $this->url ) ) {
            wp_die( __( 'It is required to have a url to use Chugach_Rest_API_Posts', 'rest-api-posts' ) );
        }
    }
    
    private function set_url( $url = false ) {
        
        $this->url = ! empty( $url ) ? $url : $this->url;
        $this->url = trailingslashit( $this->url );
        $this->url = trailingslashit( sprintf( '%swp-json/wp/v2', $this->url ) ); 
    }
    
    public function get_posts( $args = [] ) {
                        
        // default to only retrieve a single page with per_page posts
        $defaults = [ 'per_page' => $this->per_page, 'page' => $this->page, '_embed' => '' ];
        
        $remote_url = sprintf( '%sposts', $this->url ); 
        
        // Add cat?
        if( ! empty( $args ) ) {
            $args = wp_parse_args( $args, $defaults );
            $remote_url = add_query_arg( $args, $remote_url ); 
            
        }
        
        if ( false === ( $rows = get_transient( sprintf( 'rss_posts_%s', $args['cat'] ) ) ) ) :
        
            $response = wp_remote_get( $remote_url );
        
            if( is_wp_error( $response ) ) {
                return;
            }
            
            $headers = $response['headers'];
            
            $total_posts = $headers['x-wp-total'];
            $total_pages = $headers['x-wp-totalpages'];
                
            $rows = [];
            
            // Rest API only allows max 100 posts_per_page, so this is a hack that loops through the posts 50 at a time
            if( $args['page'] > 1 && ( $total_posts > $args['per_page'] ) ) {
                            
                $page = 1;
                
                while( $page <= $total_pages ) {
                    $args = [ 'page' => $page ];
                    $remote_url = add_query_arg( $args, $remote_url );  
                    $response = wp_remote_get( $remote_url );
                    if( is_wp_error( $response ) ) {
                        break;
                    }
                    
                    $posts = json_decode( wp_remote_retrieve_body( $response ) ); 
                    $rows = array_merge_recursive($rows, $posts );
                    $page++;
                }
                
                
            } else {
               $rows = json_decode( wp_remote_retrieve_body( $response ) );  
            }
        
            set_transient( sprintf( 'rss_posts_%s', $args['cat'] ), $rows, 1 * HOUR_IN_SECONDS );
        
        endif;
        
        return $rows;
    }
    
    
    public function get_post( $post_id = false ) {
        
        $post_id = absint( $post_id );
 
        if( empty( $post_id ) ) {
            return false;
        }
        
        // Add media
        $args = [ '_embed' => '' ];
        
        $remote_url = sprintf( '%sposts/%s', $this->url, $post_id );  
        $remote_url = add_query_arg( $args, $remote_url );  
        
        if ( false === ( $_post = get_transient( sprintf( 'featured_rss_post_%s', $post_id ) ) ) ) :
    
            $response = wp_remote_get( $remote_url );
    
            if( is_wp_error( $response ) ) {
                return;
            }
            
            $_post = json_decode( wp_remote_retrieve_body( $response ) );  
            
            set_transient( sprintf( 'featured_rss_post_%s', $post_id ), $_post, 1 * HOUR_IN_SECONDS );
        
        endif;
        
        
                
        if( empty( $_post->id ) ) {
            return;
        }
        
        return $_post;
    }
    
    
    public function get_post_thumbnail( $_post ) {
        
        $thumbnail = false;
        
        if ( ! empty( $_post->featured_media ) && isset( $_post->_embedded ) ) {
            $image = $_post->_embedded->{'wp:featuredmedia'}[0]->source_url;
            if( empty( $image ) ) {
                return false;
            }
            
            $sizes = $_post->_embedded->{'wp:featuredmedia'}[0]->media_details->sizes;
            
            $size = 'medium';
            
            if( empty( $sizes->medium ) ) {
                $size = 'full';
            }
            $thumbnail = $sizes->{$size}->source_url;
        } 
        
        return $thumbnail;;
    }
        
}