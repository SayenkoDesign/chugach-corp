<?php

/*
Global - Hero
		
*/


if( ! class_exists( 'Hero_Section' ) ) {
    class Hero_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
            
            $post_id = get_queried_object();
                        
            $fields = get_field( 'hero', $post_id );            
            $this->set_fields( $fields );
            
            $settings = [];
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
                     $this->get_name() . '-hero',
                     $this->get_name() . '-hero-category'
                ]
            );
            
            $background_image       = $this->get_fields( 'background_image' );
            $background_position_x  = strtolower(  $this->get_fields( 'background_position_x' ) );
            $background_position_y  = strtolower( $this->get_fields( 'background_position_y' ) );
            $background_overlay     = $this->get_fields( 'background_overlay' );
            
            if( ! empty( $background_image ) ) {
                $background_image = _s_get_acf_image( $background_image, 'hero', true );
                
                $this->add_render_attribute( 'wrapper', 'class', 'has-background' );
                $this->add_render_attribute( 'background', 'class', 'background-image' );
                $this->add_render_attribute( 'background', 'style', sprintf( 'background-image: url(%s);', $background_image ) );
                $this->add_render_attribute( 'background', 'style', sprintf( 'background-position: %s %s;', 
                                                                          $background_position_x, $background_position_y ) );
                
                if( true == $background_overlay ) {
                     $this->add_render_attribute( 'background', 'class', 'background-overlay' ); 
                }
                                                                          
            }             
        } 
        
        
        public function after_render() {
            $shape = sprintf( '<div class="shape"><img src="%sglobal/hero-bottom.png" /></div>', trailingslashit( THEME_IMG ) );                
            return sprintf( '</div></div></div>%s</%s>', $shape, esc_html( $this->get_html_tag() ) );
        }
           
        
        // Add content
        public function render() {
            
            $fields = $this->get_fields(); 
            
            $heading        = single_cat_title( '', false );
            $heading        = _s_format_string( $heading, 'h1' );
            
            if( ! empty( category_description() ) ) {
                $heading = category_description();
            }
            
            $logo = $this->get_fields( 'logo' );
            if( ! empty( $logo ) ) {
                $logo = sprintf( '<div class="thumbnail">%s</div>', _s_get_acf_image( $logo, 'medium' ) );
            }
            
            $button = sprintf( '<a href="%s" class="button clear">media inquiries</a>', media_contact_url() );

            return sprintf( '<div class="row align-middle">
                                <div class="column">
                                    <div class="hero-content">%s%s
                                        <div class="media-buttons">%s%s</div>
                                    </div>
                                </div>
                             </div>', 
                             $logo,
                            $heading,
                            _s_get_social_icons(),
                            $button
                         );
        }
    }
}
   
new Hero_Section; 