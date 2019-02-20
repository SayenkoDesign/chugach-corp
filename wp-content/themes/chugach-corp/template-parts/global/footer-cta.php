<?php
// Footer - CTA

if( ! class_exists( 'Footer_CTA_Section' ) ) {
    class Footer_CTA_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
            
            $show_footer_cta = false;
            
            // default to TRUE for the blog
            if( is_page() && ! is_front_page() ) {
                $show_footer_cta = get_field( 'page_settings_call_to_action' );                
            }
            else {
                $show_footer_cta = true;
            }
            
            if( ! $show_footer_cta ) {
                return false;
            }
                        
            $fields = get_field( 'footer_cta', 'option' );
                                                
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
                     $this->get_name() . '-footer-cta'
                ]
            ); 
            
            $background_image       = $this->get_fields( 'background_image' );
            $background_position_x  = strtolower( $this->get_fields( 'background_position_x' ) );
            $background_position_y  = strtolower( $this->get_fields( 'background_position_y' ) );
            
            if( ! empty( $background_image ) ) {
                $background_image = _s_get_acf_image( $background_image, 'hero', true );
                
                $this->add_render_attribute( 'background', 'class', 'background-image' );
                $this->add_render_attribute( 'background', 'style', sprintf( 'background-image: url(%s);', $background_image ) );
                $this->add_render_attribute( 'background', 'style', sprintf( 'background-position: %s %s;', 
                                                                          $background_position_x, $background_position_y ) );

                                                                          
            }               
            
        }  
        
        
        // Add content
        public function render() {
            
            $fields = $this->get_fields();
                        
            $row = new Element_Row(); 
            $row->add_render_attribute( 'wrapper', 'class', 'align-middle medium-unstack' );
                        
            $column = new Element_Column(); 
            $column->add_render_attribute( 'wrapper', 'class', 'column-block' );  
            
            $html = '';
                         
            // Heading
            $header = new Element_Header( [ 'fields' => $fields ] ); // set fields from Constructor
            $header->set_settings( ['heading_size' => 'h1', 'subheading_size' => 'h2'] );
            $header = $header->get_element();
            if( ! empty( $header ) ) {
                $html .= sprintf( '<div class="column">%s</div>', $header );
            }
            
            // Button
            $button = new Element_Button( [ 'fields' => $fields ]  ); // set fields from Constructor
            $button->add_render_attribute( 'anchor', 'class', [ 'button', 'white', 'large' ] );             
            $button = $button->get_element();
            if( ! empty( $button ) ) {
                $html .= sprintf( '<div class="column shrink">%s</div>', $button );
            }
            
            $html = sprintf( '<div class="row large-unstack align-middle">%s</div>', $html );
            
            $html = new Element_HTML( [ 'fields' => ['html' => $html] ] ); // set fields from Constructor
            $column->add_child( $html ); 
            
            $column->add_render_attribute( 'wrapper', 'class', ['small-order-1 medium-order-2 cta-content' ] );
            $row->add_child( $column );
            
            
            // Photo
            $photo = new Element_Photo( [ 'fields' => $fields ]  );
            // Make sure we have a photo?         
            if( ! empty( $photo->get_element() ) ) {
                $column = new Element_Column(); 
                $column->add_render_attribute( 'wrapper', 'class', ['small-order-2 medium-order-1 shrink' ] );
                $column->add_child( $photo );
                $row->add_child( $column );
            }     
            
            $this->add_child( $row );         
        }
        
    }
}
   
new Footer_CTA_Section;
