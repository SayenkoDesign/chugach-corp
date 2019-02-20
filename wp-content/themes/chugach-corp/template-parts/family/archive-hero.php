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
        }
        
        
        /**
         * After section rendering.
         *
         * Used to add stuff after the section element.
         *
         * @since 1.0.0
         * @access public
         */
        public function after_render() {
                    
            $shape = sprintf( '<div class="edge"><img src="%spage/hero-bottom.png" /></edge>', trailingslashit( THEME_IMG ) );
                
            return sprintf( '</div></div></div></div>%s</%s>', $shape , esc_html( $this->get_html_tag() ) );
        }      
        
        // Add content
        public function render() {
                        
            $heading        = 'Families In Need';
            $heading        = _s_format_string( $heading, 'h1' );

            return sprintf( '<div class="row"><div class="column">%s</div></div>', $heading );
        }
    }
}
   
new Hero_Section; 