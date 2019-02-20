<?php
// Global - Events

if( ! class_exists( 'Global_Posts_Section' ) ) {
    class Global_Posts_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                                    
            // Render the section
            $this->render();
            
            // print the section
            $this->print_element();        
        }
              
        // Add default attributes to section        
        protected function _add_render_attributes() {
            
            // use parent attributes
            parent::_add_render_attributes();
    
            $this->add_render_attribute(
                'wrapper', 'class', [
                     $this->get_name() . '-posts',
                     $this->get_name() . '-posts' . '-' . $this->get_id(),
                ]
            );            
            
        }  
       
        
        // Add content
        public function render() {
                                                                        
            $row = new Element_Row(); 
            
            $column = new Element_Column(); 
            
            $post_category = get_field( 'post_category' );
            
            $posts = $this->get_events( $post_category );
            
            $heading = new Element_Html( [ 'fields' => array( 'html' => $posts ) ]  ); // set fields from Constructor
            $column->add_child( $heading );
                        
            $row->add_child( $column );
            
            $this->add_child( $row );
        }
        
        
        private function get_posts( $post_category = false ) {
                
            if( empty( $post_category ) ) {
                return false;
            }
                        
            if( is_wp_error( $post_category ) || ! $post_category instanceof WP_Term ) {
                return;
            }
                                                        
            // arguments, adjust as needed
            $args = array(
                'post_type'      => 'post',
                'posts_per_page' => 1,
                'post_status'    => 'publish',
            );
            
            if( !empty( $post_id ) ) {
                
                $args['p'] = $post_id;
                
            } else {
                
                $args['orderby']    = 'RAND';
                
                if( !empty( $cat ) ) {
                    $tax_query[] = array(
                        'taxonomy'         => 'post_tag',
                        'terms'            =>  [$cat],
                        'field'            => 'term_id',   
                        'operator'         => 'IN',
                        'include_children' => false,
                    );
                    
                    $args['tax_query'] = $tax_query;
                }       
                
            }
        
            // Use $loop, a custom variable we made up, so it doesn't overwrite anything
            $loop = new WP_Query( $args );
            
            $out = '';
        
            // have_posts() is a wrapper function for $wp_query->have_posts(). Since we
            // don't want to use $wp_query, use our custom variable instead.
            if ( $loop->have_posts() ) : 
                while ( $loop->have_posts() ) : $loop->the_post(); 
        
                    $tag_name = '';
                    $tag_link = get_permalink( get_option( 'page_for_posts' ) );
                    
                    if( !empty( $cat ) ) {
                        $tag = get_term_by( 'term_id', $cat, 'post_tag' );
                        
                        if ( ! is_wp_error( $tag ) ) {
                            $tag_name = sprintf( '<h4>%s</h4>', esc_html( $tag->name ) );   
                            $tag_link = esc_url( get_term_link( $cat ) );
                        }
                    }
     

                    
                    $title = the_title( '<h3>', '</h3>', false );
                    $description  = apply_filters( 'the_content', get_the_excerpt() );
                    $permalink  = sprintf( '<a href="%s" class="learn-more">%s</a>', get_permalink(), 'Read More' );
                    $more       = sprintf( '<a href="%s" class="learn-more">%s</a>', $tag_link, 'View More Posts' );
                    
                    $out = sprintf( '<div class="blog-post"><div class="entry-content">%s%s%s</div></div>', 
                                    $tag_name, $title, $description );
        
                endwhile;
            endif;
        
            wp_reset_postdata();
            
            $posts = sprintf( '<div class="row small-up-1 large-up-2">%s</div>', implode( '', $posts ) );
            
            return sprintf( '<div class="events"><h3>Upcoming Events</h3>%s</div>', $posts );
            
        }
        
        
        function _get_blog_post( $cat = false, $post_id = false ) {
        
            // arguments, adjust as needed
            $args = array(
                'post_type'      => 'post',
                'posts_per_page' => 1,
                'post_status'    => 'publish',
            );
            
            if( !empty( $post_id ) ) {
                
                $args['p'] = $post_id;
                
            } else {
                
                $args['orderby']    = 'RAND';
                
                if( !empty( $cat ) ) {
                    $tax_query[] = array(
                        'taxonomy'         => 'post_tag',
                        'terms'            =>  [$cat],
                        'field'            => 'term_id',   
                        'operator'         => 'IN',
                        'include_children' => false,
                    );
                    
                    $args['tax_query'] = $tax_query;
                }       
                
            }
        
            // Use $loop, a custom variable we made up, so it doesn't overwrite anything
            $loop = new WP_Query( $args );
            
            $out = '';
        
            // have_posts() is a wrapper function for $wp_query->have_posts(). Since we
            // don't want to use $wp_query, use our custom variable instead.
            if ( $loop->have_posts() ) : 
                while ( $loop->have_posts() ) : $loop->the_post(); 
        
                    $tag_name = '';
                    $tag_link = get_permalink( get_option( 'page_for_posts' ) );
                    
                    if( !empty( $cat ) ) {
                        $tag = get_term_by( 'term_id', $cat, 'post_tag' );
                        
                        if ( ! is_wp_error( $tag ) ) {
                            $tag_name = sprintf( '<h4>%s</h4>', esc_html( $tag->name ) );   
                            $tag_link = esc_url( get_term_link( $cat ) );
                        }
                    }
     
                    
                    
                    $background = get_the_post_thumbnail_url( get_the_ID(), 'large' ); 
                    if( !empty( $background ) ) {
                        $background = sprintf( '<div class="thumbnail" style="background-image: url(%s)"></div>', $background );
                    }
                    
                    
                    $title = the_title( '<h3>', '</h3>', false );
                    $description  = apply_filters( 'the_content', get_the_excerpt() );
                    $permalink  = sprintf( '<a href="%s" class="learn-more">%s</a>', get_permalink(), 'Read More' );
                    $more       = sprintf( '<a href="%s" class="learn-more">%s</a>', $tag_link, 'View More Posts' );
                    $links      = sprintf( '<p class="links">%s</p><p class="links">%s</p>', $permalink, $more );
                    
                    $out = sprintf( '<div class="blog-post"><div class="entry-content">%s%s%s%s</div>%s</div>', $tag_name, $title, $description, $links, $background );
        
                endwhile;
            endif;
        
            wp_reset_postdata();
            
            return $out;
            
        }
        
    }
}
   
new Global_Posts_Section;
