<?php
// Shareholder - Insights

if( ! class_exists( 'Shareholder_Insights_Section' ) ) {
    class Shareholder_Insights_Section extends Element_Section {
                
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'insights' );
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
                     $this->get_name() . '-insights'
                ]
            ); 
            
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-insights'
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
            $editor = $this->get_fields( 'editor' );
            
            
            $data_attributes =  ['data-aos' => 'fade-left', 'data-aos-delay' => 800 ];                   
            
            $heading        = $this->get_fields( 'heading' ) ? $this->get_fields( 'heading' ) : get_the_title();
            $heading        = _s_format_string( $heading, 'h2', $data_attributes );
 
            $data_attributes = get_data_attributes( ['data-aos' => 'fade-up', 'data-aos-delay' => 1200 ] );
            $editor = ! empty( $this->get_fields( 'editor' ) ) ? 
                                    sprintf( '<div class="entry-content" %s>%s</div>', 
                                             $data_attributes,
                                             _s_format_string( $this->get_fields( 'editor' ), 'p' )
                                              ) : '';
            
            $photos = $this->get_photos();
            $classes = '';
            if( ! empty( $photos ) ) {
                $classes = ' large-6 small-order-1 large-order-2';
                $photos = sprintf( '<div class="small-12 large-6 small-order-2 large-order-1 column">%s</div>', $photos );
            }
            
            return sprintf( '<div class="row align-middle">%s
                            <div class="small-12%s column"><div class="entry-content">%s%s</div></div></div>', 
                            $photos,
                            $classes,
                            $heading,
                            $editor
                         );
        }
        
        
        private function get_photos() {
            
            $photos = $this->get_fields( 'photos' );
            if( empty( $photos ) ) {
                return false;
            }
            
            $photo_classes = [ 'width-60', 'width-40', 'width-40', 'width-60' ];
            
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
            
            $data_attributes =  get_data_attributes( ['data-aos' => 'fade-right', 'data-aos-delay' => 1600 ] );   
            
            return sprintf( '<div class="photo-grid clearfix" %s>%s</div>', $data_attributes, $items );   
        }
        
    }
}
   
new Shareholder_Insights_Section;
