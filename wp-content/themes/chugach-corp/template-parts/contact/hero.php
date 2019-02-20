<?php
// Client - Hero

if( ! class_exists( 'Hero_Section' ) ) {
    class Hero_Section extends Element_Section {
        
        var $post_id;
        
        public function __construct() {
            parent::__construct();
                                  
            $fields = get_field( 'hero' );
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
                     $this->get_name() . '-hero',
                     $this->get_name() . '-hero' . '-' . $this->get_id(),
                ]
            ); 
            
            $background_image       = $this->get_fields( 'background_image' );
            $background_position_x  = $this->get_fields( 'background_position_x' );
            $background_position_y  = strtolower( $this->get_fields( 'background_position_y' ) );
            $background_overlay     = strtolower( $this->get_fields( 'background_overlay' ) );
            
            if( ! empty( $background_image ) ) {
                $background_image = _s_get_acf_image( $background_image, 'hero', true );
                
                $this->add_render_attribute( 'background', 'class', 'background-image' );
                $this->add_render_attribute( 'background', 'style', sprintf( 'background-image: url(%s);', $background_image ) );
                $this->add_render_attribute( 'background', 'style', sprintf( 'background-position: %s %s;', 
                                                                          $background_position_x, $background_position_y ) );
                
                if( true == $background_overlay ) {
                     $this->add_render_attribute( 'background', 'class', 'background-overlay' ); 
                }
                                                                          
            }             
            
        }  
                
            
        /**
         * After section rendering.
         *
         * Used to add stuff after the section element.
         *
         * @since 1.0.0
         * @access public
         */
        /*public function after_render() {
            
            $shape = '<div class="shape"><div><svg viewBox="0 0 100 6" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#2B70AA" d="M0 0, 70 6, 100 0, 100 6, 0 6z"/>
                    </svg></div></div>';
                
            return sprintf( '</div></div></div></div>%s</%s>', $shape , esc_html( $this->get_html_tag() ) );
        }*/
       
        
        // Add content
        public function render() {
            $fields = $this->get_fields(); 
            
            $heading        = $this->get_fields( 'heading' ) ? $this->get_fields( 'heading' ) : get_the_title();
            $heading        = _s_format_string( $heading, 'h1' );

            return sprintf( '<div class="row align-middle"><div class="column">%s</div></div>', $heading );
            
        }
        
    }
}
   
new Hero_Section;
