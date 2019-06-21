<?php
// Shareholder - Insights

if( ! class_exists( 'Portfolio_Mission_Section' ) ) {
    class Portfolio_Mission_Section extends Element_Section {
                
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'mission' );
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
                     $this->get_name() . '-mission'
                ]
            ); 
            
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-mission'
                ]
            ); 
            
            $this->add_render_attribute(
                'wrapper', [
                'data-aos' => 'fade-in',
                'data-aos-anchor-placement' => 'top-center'
             ]
            ); 
                        
        } 
        
        
       
        
        // Add content
        public function render() {
            
            
            $heading = $this->get_fields( 'heading' );

            $heading        = $this->get_fields( 'heading' ) ? $this->get_fields( 'heading' ) : get_the_title();
            $heading        = _s_format_string( $heading, 'h3' ); 
            
            $photos = $this->get_photos();
            $classes = '';
            if( ! empty( $photos ) ) {
                $classes = ' large-5 small-order-2 large-order-1';
                $photos = sprintf( '<div class="small-12 large-7 small-order-1 large-order-2 show-for-large column column-block">%s</div>', $photos );
            }
            
            // Employees
            $employees = $this->get_fields( 'employees' );
            if( ! empty( $employees['number'] ) && ! empty( $employees['label'] ) ) {
                $employees = sprintf( '<div class="employees"><span class="number">%s</span><span class="label">%s</span></div>',
                                  number_format( $employees['number'] ),
                                  $employees['label']
                                );
            }
            
            // Locations
            $locations = $this->get_fields( 'locations' );
            if( ! empty( $locations['number'] ) && ! empty( $locations['label'] ) ) {
                $locations = sprintf( '<div class="locations"><span class="number">%s</span><span class="label">%s</span></div>',
                                  number_format( $locations['number'] ),
                                  $locations['label']
                                );
            }
            
            $numbers = sprintf( '<div class="numbers">%s%s</div>', $employees, $locations );
            
            
            return sprintf( '<div class="row">%s
                            <div class="small-12%s column column-block"><div class="entry-content">%s%s</div></div></div>', 
                            $photos,
                            $classes,
                            $numbers,
                            $heading
                         );
        }
        
        
        private function get_photos() {
            
            $photos = $this->get_fields( 'photos' );
            if( empty( $photos ) ) {
                return false;
            }
            
            $photo_classes = [ 'width-40', 'width-60', 'width-60', 'width-40' ];
                        
            $items = '';
            
            foreach( $photos as $key => $photo ) {
                $background = _s_get_acf_image( $photo['ID'], 'large', true );
                $style = sprintf( ' style="background-image: url(%s);"', $background );
                
                $items .= sprintf( '<div class="%s"><div class="background"%s></div></div>', $photo_classes[$key], $style );
            }
                        
            return sprintf( '<div class="photo-grid-wrapper"><div class="photo-grid clear">%s</div></div>', $items );   
        }
        
    }
}
   
new Portfolio_Mission_Section;
