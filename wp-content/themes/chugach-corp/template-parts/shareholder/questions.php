<?php
// Shareholder - Questions

if( ! class_exists( 'Shareholder_Questions_Section' ) ) {
    class Shareholder_Questions_Section extends Element_Section {
                
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'questions' );
            $this->set_fields( $fields );
                        
            // Render the section
            if( empty( $this->render() ) ) {
                return false;
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
                     $this->get_name() . '-questions'
                ]
            ); 
            
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-questions'
                ]
            ); 
                        
        } 
        
        
       
        
        // Add content
        public function render() {

            $content = '';
            
            // Add heading
            $heading = $this->get_fields( 'heading' );
            $heading = _s_format_string( $heading, 'h2' );
           
            $buttons = $this->get_fields( 'buttons' );
            
            
            if( ! empty( $buttons ) ) {
                $button_columns = '';
                foreach( $buttons as $key => $button ) {
                    $button = new Element_Button( [ 'fields' => $button ]  ); // set fields from Constructor
                    $button->set_settings( ['raw' => true] );
                    $button->add_render_attribute( 'anchor', 'class', [ 'button', 0 == $key ? 'gold' : 'gold', 'large' ] );    
                    $button_columns .= sprintf( '<div class="column column-block shrink">%s</div>', $button->get_element() );
                }
                
                if( ! empty( $button_columns ) ) {
                    $buttons = sprintf( '<div class="row unstack-medium align-center">%s</div>', $button_columns );
                }
            }
            
            return sprintf( '<div class="row column"><header>%s</header>%s</div>', $heading, $buttons );
            
        }
        
    }
}
   
new Shareholder_Questions_Section;
