<?php
if( ! class_exists( 'Blog_Rest_Posts_Section' ) ) {
    class Blog_Rest_Posts_Section extends Element_Section {
        
        private $is_slick = false;
        
        public function __construct() {
            parent::__construct();
            
            $post_id = is_home() ? get_option('page_for_posts') : '';
            $fields = get_field( 'stories', $post_id );
            $this->set_fields( $fields );
                                                
            // Render the section
            if( empty( $this->render() ) ) {   
                return;
            }
            
            // print the section
            $this->print_element();        
        }
        
              
        // Add default attributes to section        
        protected function _add_render_attributes() {
            
            // use parent attributes
            parent::_add_render_attributes();
    
            $this->add_render_attribute(
                'wrapper', 'class', [
                     $this->get_name() . '-stories',
                ]
            ); 
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-stories',
                ],
                true
            ); 
                        
        }  
        
        
        
        // Add content
        public function render() {
                                                                            
            $heading = $this->get_fields( 'heading' ) ? $this->get_fields( 'heading' ): 'Stories';
            $heading = _s_format_string( $heading, 'h2' ); 
            
            $subheading = $this->get_fields( 'subheading' );
            $subheading = _s_format_string( $subheading, 'h3' ); 
            
            $open = '';
            $close = '';
            
            if( is_page() ) {
                $open = '<div class="column row">';
                $colse = '</div>';
            }
            
            $heading = sprintf( '%s<header>%s%s</header>%s', $open, $heading, $subheading, $close );
                        
            $featured_post = $this->get_fields( 'rss_featured_post' );
            $featured_post_id = $featured_post; 
            $featured_post = $this->get_post( $featured_post, true );
                        
            $posts = $this->get_posts( $featured_post_id );
            
            if( empty( $featured_post ) || empty( $posts ) ) {
                return false;
            }
            
            $links = sprintf( '<div class="hide-for-large">%s</div>', $this->get_links() );
            
            return sprintf( '%s<div class="posts-container row">%s%s</div>%s', $heading,  $featured_post, $posts, $links );
            
            
        }

        private function get_posts( $featured_post_id = false ) {
            $cat = $this->get_fields( 'rss_category' );
            $args = [];
            if( ! empty( $cat ) ) {
                $args['cat'] = $cat;
            }
            
            if( $featured_post_id ) {
                $args['exclude'] = $featured_post_id;    
            }
            
            // Use $loop, a custom variable we made up, so it doesn't overwrite anything
            $loop = new WP_Query( $args );
                    
            $out = '';
                        
            $formatted_posts = [];
            
            if ( $loop->have_posts() ) : 
                 while ( $loop->have_posts() ) : $loop->the_post(); 
                    $formatted_posts[] =  $this->get_post( $loop->the_post() ); 
                endwhile;
             endif;
	 
	        wp_reset_postdata();
            
            if( empty( $formatted_posts ) ) {
                return false;
            }
            

            if( count( $formatted_posts ) > 2 ) {
                
                $slides = array_chunk( $formatted_posts, 2 );
                $slides = array_map( 
                                    function( $chunk ) { 
                                        return sprintf( '<div class="post">%s</div>', join( '', $chunk ) );
                                    }, $slides );
                $out = join( '', $slides );
                $out = sprintf( '<div class="slick">%s</div>', $out );
            } else {
                $out = join( '', $formatted_posts );
            }
            
            return sprintf( '<div class="small-12 large-4 columns posts">%s</div>', $out );
        }
        
        private function get_post( $_post, $featured = false ) {
                        
            $post_id = $_post->ID;
            
            
            $h_tag = $featured ? 'h2' : 'h3';
            
            $post_title = sprintf( '<%s class="post-title">%s</%s>', $h_tag, get_the_title( $post_id ), $h_tag );
            $permalink = get_permalink( $post_id );
            $post_thumbnail = get_the_post_thumbnail_url( $_post, 'medium' );
            
            if( empty( $post_thumbnail ) ) {
                $thumbnail = get_field( 'post_image_fallback', 'option' );
                if( ! empty( $thumbnail ) ) {
                    $post_thumbnail = wp_get_attachment_image_src( $thumbnail, 'medium' );
                }   
            }
            
            $background = '';
            if( ! empty( $post_thumbnail ) ) {   
                $background = sprintf( 'style="background-image: url(%s);"', $post_thumbnail );
            }
            
            $tag = ( $featured ) ? '<div class="featured"><span>Featured</span></div>' : '';
            
            $links = $open = $close = '';
                        
            if( $featured ) {
                $links = sprintf( '<div class="show-for-large">%s</div>', $this->get_links() );
                $open = '<div class="featured-post small-12 large-8 column">';
                $close = '</div>';
            }
            
            return sprintf( '%s<article id="post-id-%s"><a href="%s" %s>%s%s</a></article>%s%s', 
                            $open,
                            $post_id, 
                            $permalink, 
                            $background, 
                            $tag, 
                            $post_title,
                            $links,
                            $close
                         );
        }
        
        
       private function get_links() {
            //$category_link = $this->get_fields( 'rss_category_link' ) ? $this->get_fields( 'rss_category_link' ) : CHUGACH_COMMUNITY_BLOG_URL;
            $category_link = $this->get_fields( 'rss_category' );
            $view_all = '';
            if( ! empty( $category_link ) ) {
                $category_link = get_term_link( $category_link );
                $view_all = sprintf( '<a href="%s">View all Stories</a>', $category_link );
            }
            
            $share = sprintf( '<a data-open="share-your-chugach-story">%s</a>', __( 'Share Your Story' ) );
            return sprintf( '<ul><li>%s</li><li>%s</li></ul>', $view_all, $share );
       }
        
    }
}
   
new Blog_Rest_Posts_Section;