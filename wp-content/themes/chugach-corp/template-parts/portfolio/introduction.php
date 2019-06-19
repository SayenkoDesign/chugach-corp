<?php
// Portfolio - Introduction

if( ! class_exists( 'Portfolio_Introduction_Section' ) ) {
    class Portfolio_Introduction_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'introduction' );
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
                     $this->get_name() . '-introduction',
                ]
            ); 
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-mission',
                ],
                true
            ); 
                        
        }  
        
        
        
        // Add content
        public function render() {
                        
            $icon =  $this->get_fields( 'icon' );  
            if( ! empty( $icon ) ) {
                $icon = _s_get_acf_image( $icon );                                
                $icon = sprintf( '<div class="column column-block shrink"><span class="icon">%s</span></div>', $icon );   
            }
              
            $heading    = $this->get_fields( 'heading' );
            $heading    = sprintf( '<header>%s</header>', 
                                       _s_format_string( $heading, 'h3' ) );
                        
            return sprintf( '<div class="row medium-unstack">%s<div class="column column-block">%s</div></div>', 
                                $icon,
                                $heading );
            
        }
        
    }
}
   
new Portfolio_Introduction_Section;
