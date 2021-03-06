<?php
// Shareholder - Services

if( ! class_exists( 'Shareholder_Services_Section' ) ) {
    class Shareholder_Services_Section extends Element_Section {
                
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'services' );
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
                     $this->get_name() . '-services'
                ]
            ); 
            
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-shareholder-services'
                ]
            ); 
                        
        } 
        
        
       
        
        // Add content
        public function render() {
            
            /*
            heading
            editor
            buttons
            photo
            video
            */
            
            
            $left = '';
            
            // Add heading
            $heading = $this->get_fields( 'heading' );
            $heading = _s_format_string( $heading, 'h2' );
            $left .= $heading;

            // Add Editor
 
            $editor = sprintf( '<div class="entry-content">%s</div>', $this->get_fields( 'editor' ) );
            $left .= $editor;

            $buttons = $this->get_fields( 'buttons' );
            if( ! empty( $buttons ) ) {
                $button_columns = '';
                foreach( $buttons as $key => $button ) {
                    $button = new Element_Button( [ 'fields' => $button ]  ); // set fields from Constructor
                    $button->set_settings( ['raw' => true] );
                    $button->add_render_attribute( 'anchor', 'class', [ 'button', 0 == $key ? 'gold' : 'blue', 'large' ] );    
                    $button_columns .= sprintf( '<div class="column column-block shrink">%s</div>', $button->get_element() );
                }
                
                if( ! empty( $button_columns ) ) {
                    $left .= sprintf( '<div class="row unstack-medium">%s</div>', $button_columns );
                }
            }
            
            $right = '';
            $video = $this->get_fields( 'video' );
            $icon = get_svg( 'play-video' );
            $play = '';
            if( ! empty( $video ) ) {
                $video = _s_get_video_embed( $video );
                $play = sprintf( '<button class="play-video" data-open="modal-video" data-src="%s" tabindex="-1">%s</button>', $video, $icon );
            }
            
            $photo = $this->get_fields( 'photo' );
            $photo = _s_get_acf_image( $photo, 'large' );
            $right .= sprintf( '<div class="photo">%s%s</div>', $photo, $play );

            return sprintf( '<div class="row"><div class="small-12 large-5 column">%s</div><div class="small-12 large-7 column">%s</div>', 
                             $left,
                             $right
                          );
        }
        
    }
}
   
new Shareholder_Services_Section;
