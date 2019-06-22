<?php

/*
Global - Hero
		
*/


if( ! class_exists( 'Hero_Section' ) ) {
    class Hero_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                        
            $fields = get_field( 'hero' );            
            $this->set_fields( $fields );
            
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
                     $this->get_name() . '-hero'
                ]
            );
            
            $background_image       = $this->get_fields( 'background_image' );
            
            if( ! empty( $background_image ) ) {
                $background_image = _s_get_acf_image( $background_image, 'hero', true );
                $background_position_x  = strtolower(  $this->get_fields( 'background_position_x' ) );
                $background_position_y  = strtolower( $this->get_fields( 'background_position_y' ) );
                $background_overlay     = $this->get_fields( 'background_overlay' );
                
                $this->add_render_attribute( 'wrapper', 'class', 'has-background' );
                $this->add_render_attribute( 'background', 'class', 'background-image' );
                $this->add_render_attribute( 'background', 'style', sprintf( 'background-image: url(%s);', $background_image ) );
                $this->add_render_attribute( 'background', 'style', sprintf( 'background-position: %s %s;', 
                                                                          $background_position_x, $background_position_y ) );
                
                if( true == $background_overlay ) {
                     $this->add_render_attribute( 'background', 'class', 'background-overlay' ); 
                }
                                                                          
            }             
        } 
        
        
        public function after_render() {
            
            $shape = '';
            
            if( ! empty( $this->get_fields( 'background_image' ) ) ) {
                $shape = sprintf( '<div class="shape"><img src="%sglobal/hero-bottom.png" /></div>', trailingslashit( THEME_IMG ) ); 
            }
            return sprintf( '</div></div></div>%s</%s>', $shape, esc_html( $this->get_html_tag() ) );
        }
           
        
        // Add content
        public function render() {
                                    
            $heading        = $this->get_fields( 'heading' ) ? $this->get_fields( 'heading' ) : get_the_title();
            $heading        = _s_format_string( $heading, 'h1' );
            
            $subheading = empty( $this->get_fields( 'subheading' ) ) ? '' : _s_format_string( $this->get_fields( 'subheading' ), 'h2' );
            
            $description = empty( $this->get_fields( 'description' ) ) ? '' : _s_format_string( $this->get_fields( 'description' ), 'p' );

            return sprintf( '<div class="row align-middle"><div class="column"><div class="hero-content">%s%s%s</div></div></div>', 
                            $heading,
                            $subheading,
                            $description
                         );
        }
    }
}
   
new Hero_Section; 