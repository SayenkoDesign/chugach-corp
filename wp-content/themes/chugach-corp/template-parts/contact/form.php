<?php
if( ! class_exists( 'Contact_Form_Section' ) ) {
    class Contact_Form_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'form' );
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
                     $this->get_name() . '-form',
                ]
            ); 
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-form',
                ],
                true
            ); 
                        
        }  
        
        
        
        // Add content
        public function render() {
            
            $fields = $this->get_fields();  
                                                                
            $heading = $this->get_fields( 'heading' ) ? $this->get_fields( 'heading' ): 'General Inquiries';
            $heading = _s_format_string( $heading, 'h2' ); 
            
            $form_id = $this->get_fields( 'form_id' ); 
            $form = GFAPI::get_form( $form_id );
            if( false !== $form ) {
               $form = do_shortcode( sprintf( '[gravityform id="%s" title="false" description="false" ajax="false"]', $form_id ) );
            }
            
            return sprintf( '<div class="entry-content"><div class="row large-unstack"><div class="column">%s</div><div class="column shrink">%s</div></div>%s</div>', 
                            $heading,
                            _s_get_social_icons(),
                            $form   
                          );
        }
        
    }
}
   
new Contact_Form_Section;
