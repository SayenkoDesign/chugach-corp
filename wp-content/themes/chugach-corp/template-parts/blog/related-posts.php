<?php

/*
Blog - Related Posts
*/


if( ! class_exists( 'Related_Posts' ) ) {
    class Related_Posts extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                        
            //$fields = get_field( 'hero' );            
            //$this->set_fields( $fields );
            
            $settings = [];
            $this->set_settings( $settings );
            
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
                     $this->get_name() . '-related-posts'
                ]
            );            
        } 
        
        
       
           
        
        // Add content
        public function render() {
                        
            $heading        = __( 'Related News & Media', '_s' );
            $heading        = _s_format_string( $heading, 'h2' );
            
            $args = $this->_s_get_related_posts_query_args();
            
            $loop = new WP_Query( $args );
            
            $posts = [];
	
            if ( $loop->have_posts() ) : 
                while ( $loop->have_posts() ) : $loop->the_post(); 
                    $posts[] = sprintf( '<div class="column">%s</div>', _s_get_template_part( 'template-parts', 'content-post-column', false, true ) );
                endwhile;
            endif;
            
            wp_reset_postdata();
            
            if( empty( $posts ) ) {
                return false;
            }
            
            return sprintf( '<header class="column row text-center">%s</header><div class="row slick">%s</div>', $heading, join( '', $posts ) );            
        }
        
        
        // Related posts query args based on categories
        private function _s_get_related_posts_query_args( $post_id = false, $related_count = 12, $args = array() ) {
	
            if( empty( $post_id ) ) {
                $post_id = get_the_ID();
            }
            
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
            
            return wp_parse_args( $args, $default_args );
        
        }

    }
}
   
new Related_Posts; 