<?php
// Page Builder - Columns

if( ! class_exists( 'Page_Builder_Columns_Section' ) ) {
    class Page_Builder_Columns_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                        
            $fields = get_sub_field( 'columns' );
            $this->set_fields( $fields );
            
            $settings = get_sub_field( 'settings' );
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
                     $this->get_name() . '-columns',
                     $this->get_name() . '-columns' . '-' . $this->get_id(),
                ]
            );            
            
        }  
       
        
        // Add content
        public function render() {
                                                
            $fields = $this->get_fields();
            
            $row = new Element_Row(); 
            $column = new Element_Column(); 
            
             // Heading
            $heading = new Element_Header( [ 'fields' => $fields ]  ); // set fields from Constructor
            $column->add_child( $heading );
            $row->add_child( $column );
            $this->add_child( $row );
                                                                        
            $row = new Element_Row(); 
            $row->add_render_attribute( 'wrapper', 'class', 'large-unstack' );
            
            $column = new Element_Column(); 
            
            // Editor
            $editor = new Element_Editor( [ 'fields' => ['editor' => $fields['column_left'] ] ] );
            $column->add_child( $editor );            
            $row->add_child( $column );
            
            $column = new Element_Column(); 
            
            // Editor
            $editor = new Element_Editor( [ 'fields' => ['editor' => $fields['column_right'] ] ] );
            $column->add_child( $editor );            
            $row->add_child( $column );
            
            $this->add_child( $row ); 
        }
        
    }
}
   
new Page_Builder_Columns_Section;
