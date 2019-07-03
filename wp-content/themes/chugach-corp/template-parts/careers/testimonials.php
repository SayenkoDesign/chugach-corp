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
            
            $heading    = $this->get_fields( 'heading' ) ? $this->get_fields( 'heading' ) : 'Testimonials';
            $heading    = _s_format_string( $heading, 'h2' );
                                       
            return sprintf( '<div class="column row align-middle"><header>%s</header><div class="testimonials"><div class="slick">%s</div></div></div></div>', 
                            $heading,
                            join( '', $testimonials )
                            );
        }
        
        private function get_testimonials() {
            
            $slides = [];
            
            $post_ids = $this->get_fields( 'posts' );
                                                
            // arguments, adjust as needed
            $args = array(
                'post_type'      => 'testimonial',
                'posts_per_page' => 100,
                'post_status'    => 'publish'
            );
            
            if( ! empty( $post_ids ) ) {
                $args['orderby'] = 'post__in';
                $args['post__in'] = $post_ids;
                $args['posts_per_page'] = count( $post_ids );
            }
        
            // Use $loop, a custom variable we made up, so it doesn't overwrite anything
            $loop = new WP_Query( $args );
        
            // have_posts() is a wrapper function for $wp_query->have_posts(). Since we
            // don't want to use $wp_query, use our custom variable instead.
            if ( $loop->have_posts() ) :                 
            
                 while ( $loop->have_posts() ) : $loop->the_post(); 
        
                    $title =  _s_format_string( get_the_title(), 'h3' );
                    $position = get_field( 'position' );
                    if( ! empty( $position ) ) {
                        $position = _s_format_string( $position, 'h5' );
                        
                    }
                    
                    
                    
                    $thumbnail = '';
                    $photo = get_the_post_thumbnail_url( get_the_ID(), 'thumbnail' );
                    if( ! empty( $photo ) ) {
                        $thumbnail = sprintf( '<div class="thumbnail" style="background-image: url(%s);"></div>', $photo );
                    }
                    
                    $title = sprintf( '<footer>%s%s%s</footer>', $thumbnail, $title, $position  );
                                                    
                    $slides[] = sprintf( '<div class="testimonial">%s%s</div>', 
                                           apply_filters( 'pb_the_content', get_the_content() ), 
                                           $title
                                           );
                            
                endwhile;
            endif;
            wp_reset_postdata();  
            
            return $slides; 
        }
              
    }
}
   
new Careers_Testimonials_Section;

    