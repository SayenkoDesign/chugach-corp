<?php
// About - Vision

if( ! class_exists( 'About_Vision_Section' ) ) {
    class About_Vision_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'our_vision' );
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
                     $this->get_name() . '-vision',
                     $this->get_name() . '-vision' . '-' . $this->get_id(),
                ]
            ); 
                        
        }  
        
        
        // Add content
        public function render() {
            
            $heading = _s_format_string( $this->get_fields( 'heading' ), 'h2' );
            $description = $this->get_fields( 'description' );
            
            $photo = $this->get_fields( 'photo' );
            if( ! empty( $photo ) ) {
                $video = $this->get_fields( 'video' ); 
                if( !empty( $video ) ) {
                    $video_url = _s_get_video_embed( $video );
                    $video = sprintf( '<button class="play-video" data-open="modal-video" data-src="%s">%s<span class="screen-reader-text">Watch Video</span></button>', 
                                      $video_url, get_svg( 'play-hero' ) );
                }
                
                $photo = sprintf( '<div class="photo">%s%s</div>', $video, _s_get_acf_image( $photo ) );
            }
            
            
            
            return sprintf( '<div class="row"><div class="column small-12 large-4">%s%s</div>
                            <div class="column small-12 large-8">%s</div></div>', $heading, $description, $photo );
            
        }
        
    }
}
   
new About_Vision_Section;
