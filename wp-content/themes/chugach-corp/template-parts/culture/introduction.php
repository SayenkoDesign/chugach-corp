<?php
// Culture - Introduction

if( ! class_exists( 'Culture_Introduction_Section' ) ) {
    class Culture_Introduction_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'introduction' );
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
                     $this->get_name() . '-introduction',
                     $this->get_name() . '-introduction' . '-' . $this->get_id(),
                ]
            ); 
                        
        }  
        
        
        // Add content
        public function render() {
            
            $heading = _s_format_string( $this->get_fields( 'heading' ), 'h3' );
            $description = $this->get_fields( 'description' );
            $classes = '';
            
            $photo = $this->get_fields( 'photo' );
            if( ! empty( $photo ) ) {
                $video = $this->get_fields( 'video' ); 
                $has_video = '';
                if( !empty( $video ) ) {
                    $video_url = _s_get_video_embed( $video );
                    $video = sprintf( '<button class="play-video" data-open="modal-video" data-src="%s">%s
                                       <span class="screen-reader-text">Watch Video</span></button>', 
                                      $video_url, get_svg( 'play-hero' ) );
                    $has_video = ' has-video';
                }
                
                $photo = sprintf( '<div class="column column-block small-12 large-5"><div class="photo%s">%s%s</div></div>', $has_video, $video, _s_get_acf_image( $photo ) );
                $classes = ' small-12 large-7';
            }
            
            $button_args = $this->get_fields( 'button' );
            $button_style = ! empty( $button_args['style'] )  ? strtolower( $button_args['style'] ) : 'button';

            $button = new Element_Button( [ 'fields' => $this->get_fields('button') ]  ); // set fields from Constructor
            $button->add_render_attribute( 'anchor', 'class', $button_style ); 
            $button = $button->get_element();
            
            return sprintf( '<div class="row">%s
                            <div class="column column-block%s">%s%s%s</div></div>', $photo, $classes, $heading, $description, $button );
            
        }
        
    }
}
   
new Culture_Introduction_Section;
