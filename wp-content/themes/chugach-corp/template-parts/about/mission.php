<?php
// About - Mission

if( ! class_exists( 'About_Mission_Section' ) ) {
    class About_Mission_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'our_mission' );
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
                     $this->get_name() . '-mission',
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
            
            $fields = $this->get_fields();  
                                                                
            $icon = sprintf( '<span class="icon"><img src="%swho-we-are/icons/megaphone.svg" /></span>', trailingslashit( THEME_IMG ) );     
            $heading    = $this->get_fields( 'heading' ) ? $this->get_fields( 'heading' ) : 'Our Mission';
            $heading    = sprintf( '<header>%s%s</header>', 
                                       $icon,
                                       _s_format_string( $heading, 'h2' ) );
            
            $subheading = empty( $this->get_fields( 'subheading' ) ) ? '' : sprintf( '%s', _s_format_string( $this->get_fields( 'subheading' ), 'h3' ) );
            
            return sprintf( '<div class="row large-unstack"><div class="column column-block shrink">%s</div><div class="column column-block">%s</div></div>', 
                                $heading, $subheading );
            
        }
        
    }
}
   
new About_Mission_Section;
