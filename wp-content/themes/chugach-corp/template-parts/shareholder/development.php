<?php
// Shareholder - Development

if( ! class_exists( 'Shareholder_Development_Section' ) ) {
    class Shareholder_Development_Section extends Element_Section {
                
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'development' );
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
                     $this->get_name() . '-development'
                ]
            ); 
            
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-shareholder-development'
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
        
        
       
        
        // Add content
        public function render() {
            
                        
            $heading        = $this->get_fields( 'heading' ) ? $this->get_fields( 'heading' ) : get_the_title();
            $heading        = _s_format_string( $heading, 'h2' );
            
            $subheading = empty( $this->get_fields( 'subheading' ) ) ? '' : _s_format_string( $this->get_fields( 'subheading' ), 'h3' );
            
            
            
            $description = empty( $this->get_fields( 'description' ) ) ? '' : _s_format_string( $this->get_fields( 'description' ), 'p' );
            
            $video = $this->get_fields( 'video' );
            $icon = get_svg( 'play-video' );
            $play = '';
            if( ! empty( $video ) ) {
                $video = _s_get_video_embed( $video );
                $play = sprintf( '<button class="play-video" data-open="modal-video" data-src="%s" tabindex="-1">%s</button>', $video, $icon );
            }
            
            $content = sprintf( '<div class="entry-content">%s%s</div>', $description, $play );

            return sprintf( '<div class="row align-middle"><div class="column"><header>%s%s</header><div class="entry-content">%s</div></div></div>', 
                            $heading,
                            $subheading,
                            $content
                         );
        }
        
    }
}
   
new Shareholder_Development_Section;
