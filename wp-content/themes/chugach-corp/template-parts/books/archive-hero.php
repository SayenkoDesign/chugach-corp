<?php

/*
Books - Archive Hero
		
*/


if( ! class_exists( 'Hero_Section' ) ) {
    class Hero_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                        
            $fields = get_field( 'book_settings', 'option' );            
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
        }        
        
        // Add content
        public function render() {
            
            $fields = $this->get_fields(); 
            
            $hero = $this->get_fields( 'hero' );
            
            $defaults = [
                'background_image' => false,
                'background_position_x' => 'center',
                'background_position_x' => 'center',
                'heading' => 'Books',
                'subheading_left' => '',
                'subheading_right' => ''
            ];
            
            $hero = wp_parse_args( $hero, $defaults );
            
            $background_image       = $hero['background_image'];
            $background_position_x  = $hero['background_position_x'];
            $background_position_y  = $hero['background_position_y'];
            
            if( ! empty( $background_image ) ) {
                $background_image = _s_get_acf_image( $background_image, 'hero', true );
                
                $this->add_render_attribute( 'background', 'class', 'background-image' );
                $this->add_render_attribute( 'background', 'style', sprintf( 'background-image: url(%s);', $background_image ) );
                $this->add_render_attribute( 'background', 'style', sprintf( 'background-position: %s %s;', 
                                                                          $background_position_x, $background_position_y ) );
            }             
            
            $heading = $hero['heading'];
            $heading = _s_format_string( $heading, 'h1' );
            
            $subheading_left = _s_format_string( $hero['subheading_left'], 'h3' );
            $subheading_right = _s_format_string( $hero['subheading_right'], 'h3' );

            return sprintf( '<div class="row align-middle"><div class="column">%s<div class="row large-unstack text-center"><div class="column shrink">%s</div><div class="column shrink">%s</div></div>', 
                             $heading,
                             $subheading_left,
                             $subheading_right    
                          );
        }
    }
}
   
new Hero_Section; 