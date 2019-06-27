<?php

/*
Global - Hero
		
*/


if( ! class_exists( 'Hero_Section' ) ) {
    class Hero_Section extends Element_Section {
        
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
                     $this->get_name() . '-hero'
                ]
            );
        }
        
        
        public function after_render() {
            
            $shape = '<div class="shape"></div>';
                
            return sprintf( '</div></div></div></div>%s</%s>', $shape, esc_html( $this->get_html_tag() ) );
        }
        
        
        // Add content
        public function render() {
            
            $heading = 'Search Results';
            $heading = _s_format_string( $heading, 'h1' );

            return sprintf( '<div class="row align-middle"><div class="column"><div class="hero-content">%s</div></div></div>', 
                            $heading
                         );
        }
    }
}
   
new Hero_Section; 