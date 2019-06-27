<?php

/*
Careers - Testimonials
		
*/    
    
if( ! class_exists( 'Careers_Testimonials_Section' ) ) {
    class Careers_Testimonials_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
            
            $fields = get_field( 'testimonials' );            
            $this->set_fields( $fields );

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
                     $this->get_name() . '-testimonials',
                     $this->get_name() . '-testimonials' . '-' . $this->get_id(),
                ]
            );
            
            $background_image       = $this->get_fields( 'background_image' );
            $background_position_x  = strtolower( $this->get_fields( 'background_position_x' ) );
            $background_position_y  = strtolower( $this->get_fields( 'background_position_y' ) );
            $background_overlay     = $this->get_fields( 'background_overlay' );
            
            if( ! empty( $background_image ) ) {
                $background_image = _s_get_acf_image( $background_image, 'hero', true );
                                
                $this->add_render_attribute( 'wrapper', 'style', sprintf( 'background-image: url(%s);', $background_image ) );
                $this->add_render_attribute( 'wrapper', 'style', sprintf( 'background-position: %s %s;', 
                                                                          $background_position_x, $background_position_y ) );
                
                if( true == $background_overlay ) {
                     $this->add_render_attribute( 'wrapper', 'class', 'background-overlay' ); 
                }
                                                                          
            }  
        }
        
        // Add content
        public function render() {
            
            $testimonials = $this->get_testimonials();
            
            if( empty( $testimonials ) ) {
                return false;
            }
            
            // split testimonials into 2's
            $columns = array_chunk( $testimonials, 2 );
                        
            $rows = array_map( array( $this, 'wrap_columns' ), $columns );
                                       
            return sprintf( '<div class="row align-middle"><div class="column"><header><h2><span>Reviews</span></h2></header><div class="slick">%s</div></div></div>', 
                            join( '', $rows ) );
        }
        
        private function get_testimonials() {
            
            $slides = [];
            
            $stars = sprintf('<div class="stars"><img src="%sservice/stars.png" alt="5 stars" /></div>', trailingslashit( THEME_IMG ) ); 
            
            // arguments, adjust as needed
            $args = array(
                'post_type'      => 'testimonial',
                'posts_per_page' => 100,
                'post_status'    => 'publish'
            );
        
            // Use $loop, a custom variable we made up, so it doesn't overwrite anything
            $loop = new WP_Query( $args );
        
            // have_posts() is a wrapper function for $wp_query->have_posts(). Since we
            // don't want to use $wp_query, use our custom variable instead.
            if ( $loop->have_posts() ) :                 
            
                 while ( $loop->have_posts() ) : $loop->the_post(); 
        
                    $cite =  _s_format_string( get_the_title(), 'h3' );
                                                    
                    $blockquote = sprintf( '<blockquote>%s%s%s</blockquote>', 
                                           $stars, apply_filters( 'pb_the_content', get_the_content() ), $cite );
                    
                    $slides[] = sprintf( '<div class="column">%s</div>', $blockquote );
        
                endwhile;
            endif;
            wp_reset_postdata();  
            
            return $slides; 
        }
        
        
        private function wrap_columns( $columns ) {
            if( ! empty( $columns ) ) {
                return sprintf( '<div class="slide"><div class="row large-unstack align-middle">%s</div></div>', join( '', $columns ) );
            }
        }
      
    }
}
   
new Careers_Testimonials_Section;

    