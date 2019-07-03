<?php
// Careers - Why

if( ! class_exists( 'Careers_Why_Section' ) ) {
    class Careers_Why_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'mission' );
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
                     $this->get_name() . '-why',
                ]
            ); 
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-why',
                ],
                true
            ); 
                        
        }  
        
        
        
        // Add content
        public function render() {
                                                                            
            $heading    = $this->get_fields( 'heading' ) ? $this->get_fields( 'heading' ) : 'Why';
            $heading    = _s_format_string( $heading, 'h2' );
            
            $subheading = empty( $this->get_fields( 'subheading' ) ) ? '' : sprintf( '%s', _s_format_string( $this->get_fields( 'subheading' ), 'h3' ) );
            
            $heading = sprintf( '<div class="column row"><header>%s%s</header></div>', 
                                $heading, $subheading );
            
            $grid = $this->grid();
            
            return sprintf( '%s%s', $heading, $grid );
            
        }
        

        private function grid() {
            
            $rows = $this->get_fields( 'grid' );
            
            $grid_items = '';
            
            if( ! empty( $rows ) ) {
                                
                foreach( $rows as $row ) {     
                    
                    $icon = $row['icon'];
                    $icon = sprintf( '<div class="icon">%s</div>', _s_get_acf_image( $icon, 'icon-large' ) );
                    $heading = _s_format_string( $row['heading'], 'h3' ); 
                    $description = $row['description'];  
                    $button = new Element_Button( [ 'fields' => ['button' => $row['button'] ] ]  );
                    $button = $button->get_element();
                   
                    $grid_items .= sprintf( '<div class="column column-block"><div class="grid-item">%s%s%s%s</div></div>', 
                                     $icon, 
                                     $heading,
                                     $description,
                                     $button 
                                   
                                   );
                }
                
                return sprintf( '<div class="row small-up-2 medium-up-3 align-center grid">%s</div>', 
                            $grid_items
                          );   
            }
        }
    }
}
   
new Careers_Why_Section;