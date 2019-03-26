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
                                                                
            $header = '';
            $heading = $this->get_fields( 'heading' );
            $subheading = $this->get_fields( 'subheading' );
            if( ! empty( $subheading ) ) {                
                
                $subheading = sprintf( '<div class="column column-block subheading"><div class="entry-content">%s</div></div>', 
                                        $subheading );
            }
            
            $icon = sprintf( '<span class="icon"><img src="%swho-we-are/icons/megaphone.svg" /></span>', trailingslashit( THEME_IMG ) );            
            
            if( ! empty( $heading ) ) {
                $heading = sprintf( '<h2>%s</h2>', $heading );
                $header = sprintf( '<div class="column column-block"><header>%s%s</header></div>', $icon, $heading  );
                return  sprintf( '<div class="header"><div class="row medium-unstack align-middle">%s%s</div></div>',
                                  $header, $subheading );
            }
            
        }
        
    }
}
   
new About_Mission_Section;
