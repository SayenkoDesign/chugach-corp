<?php
if( ! class_exists( 'Contact_Businesses_Section' ) ) {
    class Contact_Businesses_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
            $fields['heading'] = get_field( 'business_heading' );
            $fields['logos'] = get_field( 'logos' );
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
                     $this->get_name() . '-businesses',
                ]
            ); 
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-businesses',
                ],
                true
            ); 
                        
        }  
        
        
        
        // Add content
        public function render() {
                                                                            
            $rows = $this->get_fields( 'logos' );
            if( empty( $rows ) ) {
                return false;
            }
            
            $columns = '';
            
            foreach( $rows as $row ) {
                
                $image = $row['image'];
                $image = _s_get_acf_image( $image, 'medium' );
                $url = $row['url'];
                $tag = 'span';
                $anchor = '';
                if( !empty( $url ) ) {
                    $tag = 'a';
                    $anchor = sprintf( ' href="%s"', $url );
                }
                
                $columns .= sprintf( '<div class="column"><div class="logo"><%1$s%2$s>%3$s</%1$s></div></div>', 
                                $tag, 
                                $anchor, 
                                $image
                );
            }
            
            $heading = $this->get_fields( 'heading' ) ? $this->get_fields( 'heading' ): 'Our Businesses';
            $heading = _s_format_string( $heading, 'h2' ); 
            
            return sprintf( '%s<div class="row collapse small-up-2 medium-up-3">%s</div>', 
                                $heading, 
                                $columns
                               );
        }
        
    }
}
   
new Contact_Businesses_Section;
