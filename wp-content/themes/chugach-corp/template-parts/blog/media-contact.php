<?php
if( ! class_exists( 'Blog_Media_Contact_Section' ) ) {
    class Blog_Media_Contact_Section extends Element_Section {
        
        private $is_slick = false; // are we building a slider?
        
        public function __construct() {
            parent::__construct();
            
            $fields = get_field( 'media_inquiries', get_option('page_for_posts') );            
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
                     $this->get_name() . '-media-contact',
                ]
            ); 
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-media-contact',
                ],
                true
            ); 
                        
        }  
        
        
        
        // Add content
        public function render() {
                        
            $heading = $this->get_fields( 'heading' );
            $heading = _s_format_string( $heading, 'h2' );
            
            if( empty( $heading ) ) {
                return false;
            }
            
            $button = $this->get_fields( 'button' );
            $button = $this->get_fields( 'button' ) ? $this->get_fields( 'button' ) : 'Media Inquiries';
            $url = media_contact_url();
            
            return sprintf( '<div class="row column text-center">%s<p><a href="%s" class="button orange">%s</a></p></div>', 
                            $heading, $url, $button );
            
        }
        
       
    }
}
   
new Blog_Media_Contact_Section;
