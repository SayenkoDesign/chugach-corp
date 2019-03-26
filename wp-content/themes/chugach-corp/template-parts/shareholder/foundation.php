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
                     $this->get_name() . '-services'
                ]
            ); 
            
            $this->add_render_attribute(
                'wrapper', [
                'data-aos' => 'fade-in',
                'data-aos-anchor-placement' => 'bottom-bottom'
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
            $heading_data_attributes = [
                'data-aos' => 'fade-right', 
                'data-aos-delay' => 800
             ];
            $heading = $this->get_fields( 'heading' );
            $heading = _s_format_string( $heading, 'h2', $heading_data_attributes );
            $left .= $heading;

            // Add Editor
            $editor_data_attributes = get_data_attributes( [
                'data-aos' => 'fade-up', 
                'data-aos-delay' => 1200
             ] );
            $editor = sprintf( '<div class="entry-content" %s>%s</div>', $editor_data_attributes, $this->get_fields( 'editor' ) );
            $left .= $editor;

            $buttons = $this->get_fields( 'buttons' );
            if( ! empty( $buttons ) ) {
                $button_columns = '';
                foreach( $buttons as $key => $button ) {
                    $button = new Element_Button( [ 'fields' => $button ]  ); // set fields from Constructor
                    $button->set_settings( ['raw' => true] );
                    $button->add_render_attribute( 'anchor', 'class', [ 'button', 0 == $key ? 'gold' : 'blue', 'large' ] );    
                    $column_data_attributes = get_data_attributes( [
                        'data-aos' => 0 == $key % 2 ? 'fade-right' : 'fade-left', 
                        'data-aos-delay' => 1600  
                     ] );
                    $button_columns .= sprintf( '<div class="column column-block shrink" %s>%s</div>', $column_data_attributes, $button->get_element() );
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
            $photo_data_attributes = get_data_attributes( [
                'data-aos' => 'fade-left', 
                'data-aos-delay' => 2000
             ] );
            $right .= sprintf( '<div class="photo" %s>%s%s</div>', $photo_data_attributes, $photo, $play );

            return sprintf( '<div class="row"><div class="small-12 large-5 column">%s</div><div class="small-12 large-7 column">%s</div>', 
                             $left,
                             $right
                          );
        }
        
    }
}
   
new Shareholder_Services_Section;
