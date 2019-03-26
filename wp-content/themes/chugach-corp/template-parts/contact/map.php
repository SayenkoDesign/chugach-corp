<?php
if( ! class_exists( 'Contact_Map_Section' ) ) {
    class Contact_Map_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
            
            $fields = [];              
            $fields['map'] = get_field( 'google_map' );
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
                     $this->get_name() . '-map',
                ]
            ); 
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-map',
                ],
                true
            ); 
                        
        }  
        
        
        
        // Add content
        public function render() {
                                                                            
            $map = $this->get_fields( 'map' );
            if( ! empty( $map ) ) {
                $map = do_shortcode( $map );
            }
            
            return sprintf( '<div class="map-container">%s</div>', 
                            $map  
                          );
        }
        
    }
}
   
new Contact_Map_Section;
