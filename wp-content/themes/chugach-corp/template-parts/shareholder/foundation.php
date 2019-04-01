<?php
// Shareholder - Foundation

if( ! class_exists( 'Shareholder_Foundation_Section' ) ) {
    class Shareholder_Foundation_Section extends Element_Section {
                
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'foundation' );
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
                     $this->get_name() . '-foundation'
                ]
            ); 
            
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-foundation'
                ]
            ); 
                        
        } 
        
        
       
        
        // Add content
        public function render() {

            $content = '';
            
            // Add heading
            $heading = $this->get_fields( 'heading' );
            $heading = _s_format_string( $heading, 'h2' );
           
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
                    $buttons = sprintf( '<div class="row unstack-medium align-center">%s</div>', $button_columns );
                }
            }
            
            $content .= sprintf( '<div class="row column text-center"><header>%s</header>%s</div>', $heading, $buttons );
            
            
            // Years
            $years = $this->get_fields( 'years' );
            if( ! empty( $years['number'] ) && ! empty( $years['label'] ) ) {
                $years = sprintf( '<div class="years"><span class="number">%s</span><span class="label">%s</span></div>',
                                  $years['number'],
                                  $years['label']
                                );
            }
            
            // Scholarships
            $scholarships = $this->get_fields( 'scholarships' );
            if( ! empty( $scholarships['number'] ) && ! empty( $scholarships['label'] ) ) {
                $scholarships = sprintf( '<div class="scholarships"><span class="number">%s</span><span class="label">%s</span></div>',
                                  $scholarships['number'],
                                  $scholarships['label']
                                );
            }
            
            $numbers = sprintf( '<div class="numbers">%s%s</div>', $years, $scholarships );
            
            // Add Description
            $description = sprintf( '%s<div class="entry-content">%s</div>', $numbers, $this->get_fields( 'description' ) );
                        
            $video = $this->get_fields( 'video' );
            $icon = get_svg( 'play-video' );
            $play = '';
            if( ! empty( $video ) ) {
                $video = _s_get_video_embed( $video );
                $play = sprintf( '<button class="play-video" data-open="modal-video" data-src="%s" tabindex="-1">%s</button>', $video, $icon );
            }
            
            $photo = $this->get_fields( 'image' );
            if( ! empty( $photo ) ) {
                $photo = _s_get_acf_image( $photo, 'large' );
                $photo = sprintf( '<div class="photo">%s%s</div>', $photo, $play );
            }
            
            $content = sprintf( '%s<div class="row large-unstack align-bottom"><div class="column">%s</div><div class="column">%s</div>',
                                $content,
                                $description,
                                $photo
                            
                             );

            return $content;
        }
        
    }
}
   
new Shareholder_Foundation_Section;
