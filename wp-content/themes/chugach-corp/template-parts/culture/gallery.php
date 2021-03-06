<?php
// Culture - Gallery

if( ! class_exists( 'Culture_Gallery_Section' ) ) {
    class Culture_Gallery_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'gallery' );
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
                     $this->get_name() . '-gallery',
                ]
            ); 
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-gallery',
                ],
                true
            ); 
                        
        }  
        
        
        
        // Add content
        public function render() {
            
                        
            $heading    = 'Gallery';
            $heading    = sprintf( '<div class="column row"><header>%s</header></div>', 
                                       _s_format_string( $heading, 'h2' ) );
            
            $gallery = do_shortcode( '[light-gallery limit="12"]');
                        
            return sprintf( '%s%s', 
                                $heading, $gallery );
            
        }
        
    }
}
   
new Culture_Gallery_Section;
