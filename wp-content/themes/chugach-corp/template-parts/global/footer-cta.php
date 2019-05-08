<?php
// Footer - CTA

if( ! class_exists( 'Footer_CTA_Section' ) ) {
    class Footer_CTA_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
            
            $this->set_settings( 'delay', parent::$count * 400 ); 
            
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
            
            $this->add_render_attribute(
                'wrapper', [
                'data-aos' => 'fade-in', 
                'data-aos-anchor-placement' => 'center-bottom',
                //'data-aos-anchor' => '#site-footer'
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
            $header->set_settings( ['heading_size' => 'h3'] );
            $header->add_render_attribute(
                'wrapper', [
                'data-aos' => 'fade-up', 
                'data-aos-delay' => 800,
                'data-aos-anchor' => '.section-footer-cta'
             ]
            ); 
            $header = $header->get_element();
            
            // Button
            $buttons = $this->get_fields( 'buttons' );
            $html = '';
            if( ! empty( $buttons ) ) {
                foreach( $buttons as $key => $button ) {
                    $button = new Element_Button( [ 'fields' => $button ]  ); // set fields from Constructor
                    $button->set_settings( ['raw' => true] );
                    $button->add_render_attribute( 'anchor', 'class', [ 'button', 'gold', 'large' ] );    
                    
                    $html .= sprintf( '<div class="column column-block shrink">%s</div>', $button->get_element() );
                }
                
                if( ! empty( $html ) ) {
                    $html = sprintf( '<div class="row unstack-medium align-middle align-center">%s</div>', $html );
                }
            }
            
            
            return sprintf( '<div class="row align-center"><div class="column large-9">%s%s</div></div>', $header, $html );
               
        }
        
    }
}
   
new Footer_CTA_Section;
