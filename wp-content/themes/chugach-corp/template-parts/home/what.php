<?php
// Home - What

if( ! class_exists( 'Home_What_Section' ) ) {
    class Home_What_Section extends Element_Section {
                
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'what' );
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
                     $this->get_name() . '-what'
                ]
            ); 
            
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-what'
                ]
            ); 
            
            $this->add_render_attribute(
                'wrapper', [
                'data-aos' => 'fade-in', 
                'data-aos-anchor-placement' => 'bottom-bottom'
             ]
            ); 
                        
        } 
        
        
       
        
        // Add content
        public function render() {
            
            $fields = $this->get_fields();
            
            $aos_count = 0;
            
            $data_attributes = ['data-aos' => 'zoom-in', 'data-aos-delay' => ( $aos_count++ * 100 ) + 400 ];                                 
            $heading = $fields['heading'];
            $heading = _s_format_string( $heading, 'h2', $data_attributes );
            
            $data_attributes = ['data-aos' => 'zoom-in', 'data-aos-delay' => ( $aos_count++ * 100 ) + 400 ]; 
            $subheading = $fields['subheading'];
            $subheading = _s_format_string( $subheading, 'h3', $data_attributes );
            
            $data_attributes = ['data-aos' => 'fade-up', 'data-aos-delay' => ( $aos_count++ * 100 ) + 400 ]; 
            $description = _s_format_string( $fields['description'], 'p', $data_attributes );

            return sprintf( '<div class="row align-middle"><div class="column"><header>%s%s</header>%s</div>', 
                             $heading,
                             $subheading,
                             $description
                          );
        }
        
    }
}
   
new Home_What_Section;
