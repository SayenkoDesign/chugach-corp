<?php
if( ! class_exists( 'Contact_Directory_Section' ) ) {
    class Contact_Directory_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
            
            $fields['heading'] = get_field( 'directory_heading' );
            $fields['directory'] = get_field( 'directory' );
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
                     $this->get_name() . '-directory',
                ]
            ); 
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-directory',
                ],
                true
            ); 
                        
        }  
        
        
        
        // Add content
        public function render() {
                                                                            
            $rows = $this->get_fields( 'directory' );
            if( empty( $rows ) ) {
                return false;
            }
            
            $accordion = new Foundation_Accordion;
            
            foreach( $rows as $key => $row ) {
                $accordion->add_item( $row['heading'], $row['content'], 0 == $key ? true : false );
            }
            
            $heading = $this->get_fields( 'heading' ) ? $this->get_fields( 'heading' ): 'Directory';
            $heading = _s_format_string( $heading, 'h2' ); 
            
            return sprintf( '%s<div class="entry-content">%s</div>', $heading, $accordion->get_accordion() );
        }
        
    }
}
   
new Contact_Directory_Section;
