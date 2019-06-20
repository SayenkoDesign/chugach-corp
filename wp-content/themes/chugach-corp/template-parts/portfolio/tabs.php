<?php
// Portfolio - Investment - Tabs

if( ! class_exists( 'Portfolio_Tabs_Section' ) ) {
    class Portfolio_Tabs_Section extends Element_Section {
                
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'tabs' );
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
                     $this->get_name() . '-tabs'
                ]
            ); 
            
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-tabs'
                ]
            ); 
        } 
               
        
        // Add content
        public function render() {
            
            $accordion = sprintf( '<div class="hide-for-large">%s</div>', $this->get_accordion() );
            
            $tabs = sprintf( '<div class="show-for-large"><div class="tabs-container">%s</div></div>', $this->get_tabs() );
            
            return sprintf( '<div class="column row">%s%s</div>', $accordion, $tabs );
        }
        
        private function get_tabs() {
            $rows = $this->get_fields();
            
            if( empty( $rows ) ) {
                return false;
            }
            
            $fa = new Foundation_Tabs([ 'class' => 'vertical tabs' ]);
                
            foreach( $rows as $key => $row ) {
                $active = $key ? false : true;
                $photo = $row['photo'];
                if( ! empty( $photo ) ) {
                    $photo = sprintf( '<div class="image-wrapper">%s</div>', _s_get_acf_image( $photo ) );
                }
                $content = sprintf( '%s%s', $photo, $row['text'] );
                $fa->add_item( [ 'title' => $row['tab'], 'content' => $content, 'active' => $active ] );
            }
            
            return $fa->get_tabs();
        }
        
        
        private function get_accordion() {
            $rows = $this->get_fields();
            
            if( empty( $rows ) ) {
                return false;
            }
            
            $fa = new Foundation_Accordion;
                
            foreach( $rows as $key => $row ) {
                $active = $key ? false : true;
                $photo = $row['photo'];
                if( ! empty( $photo ) ) {
                    $photo = sprintf( '<div class="image-wrapper">%s</div>', _s_get_acf_image( $photo ) );
                }
                $content = sprintf( '%s%s', $photo, $row['text'] );
                $fa->add_item( $row['tab'], $content, $active );
            }
            
            return $fa->get_accordion();
        }
        
    }
}
   
new Portfolio_Tabs_Section;
