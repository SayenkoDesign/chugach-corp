<?php
// Careers - Shareholders

if( ! class_exists( 'Careers_Shareholders_Section' ) ) {
    class Careers_Shareholders_Section extends Element_Section {
                
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'shareholders' );
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
                     $this->get_name() . '-shareholders'
                ]
            ); 
            
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-shareholders'
                ]
            );       
        } 
        
       
        
        // Add content
        public function render() {
            
            $heading    = $this->get_fields( 'heading' ) ? $this->get_fields( 'heading' ) : 'Why';
            $heading    = _s_format_string( $heading, 'h2' );
            
            $heading = sprintf( '<div class="column row"><header>%s</header></div>', 
                                $heading );

            $editor = ! empty( $this->get_fields( 'editor' ) ) ? 
                                    sprintf( '<div class="entry-content">%s</div>', 
                                             _s_format_string( $this->get_fields( 'editor' ), 'p' )
                                              ) : '';
            
            $photos = $this->get_photos();
            $classes = '';
            if( ! empty( $photos ) ) {
                $classes = ' large-6 small-order-1 large-order-2';
                $photos = sprintf( '<div class="small-12 large-6 small-order-2 large-order-1 column">%s</div>', $photos );
            }
            
            $buttons = $this->get_fields( 'buttons' );
            if( ! empty( $buttons ) ) {
                $button_columns = '';
                foreach( $buttons as $key => $button ) {
                    $button = new Element_Button( [ 'fields' => $button ]  ); // set fields from Constructor
                    $button->set_settings( ['raw' => true] );
                    $button->add_render_attribute( 'anchor', 'class', 'button gold' );    
                    $button_columns .= sprintf( '<div class="column column-block">%s</div>', $button->get_element() );
                }
                
                if( ! empty( $button_columns ) ) {
                    $buttons = sprintf( '<div class="row unstack-medium align-center">%s</div>', $button_columns );
                }
            }
            
            
            return sprintf( '%s<div class="row">%s
                            <div class="small-12%s column"><div class="entry-content">%s%s</div></div></div>', 
                            $heading,
                            $photos,
                            $classes,
                            $editor,
                            $buttons
                         );
        }
        
        
        private function get_photos() {
            
            $photos = $this->get_fields( 'photos' );
            if( empty( $photos ) ) {
                return false;
            }
            
            $photo_classes = [ 'width-40', 'width-60', 'width-60', 'width-40' ];
            
            $videos = $this->get_fields( 'videos' );
            $icon = get_svg( 'play-video' );
            $buttons = [];
            if( ! empty( $videos ) ) {
                foreach( $videos as $key => $video ) {
                    if( ! empty( $video ) ) {
                        $video = _s_get_video_embed( $video['video'] );
                        $photo = 0 == $key ? 1 : 2;
                        $buttons[$photo] = sprintf( '<button class="play-video" data-open="modal-video" data-src="%s" tabindex="-1">%s</button>', $video, $icon );
                    }
                }
            }
            
            $items = '';
            
            foreach( $photos as $key => $photo ) {
                $background = _s_get_acf_image( $photo['ID'], 'large', true );
                $style = sprintf( ' style="background-image: url(%s);"', $background );
                $video = '';
                if( ! empty( $buttons[$key] ) ) {
                    $video = $buttons[$key];
                }
                $items .= sprintf( '<div class="%s"><div class="background"%s>%s</div></div>', $photo_classes[$key], $style, $video );
            }
                        
            return sprintf( '<div class="photo-grid-wrapper"><div class="photo-grid clear">%s</div></div>', $items );   
        }
        
    }
}
   
new Careers_Shareholders_Section;
