<?php
// Homne - Donate

if( ! class_exists( 'Home_Donate_Section' ) ) {
    class Home_Donate_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'donate' );
                                                
            $this->set_fields( $fields );
            
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
                     $this->get_name() . '-donate'
                ]
            );   
            
        }  
        
        
        // Add content
        public function render() {
                        
            $fields = $this->get_fields();
                                                   
            $row = new Element_Row(); 
            $row->add_render_attribute( 'wrapper', 'class', 'large-unstack align-center align-middle' );  
            
            $column = new Element_Column(); 
            $column->add_render_attribute( 'wrapper', 'class', 'shrink' );  
            
                         
            // Heading
            $header = new Element_Header( [ 'fields' => $fields ] ); // set fields from Constructor
            $column->add_child( $header );
            $row->add_child( $column );
            
            $column = new Element_Column(); 
            $column->add_render_attribute( 'wrapper', 'class', 'shrink' );  
            
            // Button
            $button = new Element_Button( [ 'fields' => $fields ]  ); // set fields from Constructor
            $button->add_render_attribute( 'anchor', 'class', [ 'button', 'cta' ] ); 

            $column->add_child( $button );
            $row->add_child( $column );
            
            $this->add_child( $row );  
                 
        }
        
    }
}
   
new Home_Donate_Section;
