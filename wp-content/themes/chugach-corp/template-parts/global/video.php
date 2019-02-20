<?php
// Global - Video

if( ! class_exists( 'Global_Video_Section' ) ) {
    class Global_Video_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                        
            $fields = get_field( 'video' );
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
                     $this->get_name() . '-video',
                     $this->get_name() . '-video' . '-' . $this->get_id(),
                ]
            );            
            
        }  
       
        
        // Add content
        public function render() {
            
            $fields = $this->get_fields();
            
            $video_url = $fields['video_url'];
            $photo     = $fields['photo'];
            $photo     =  _s_get_acf_image( $photo, 'large' );
            $heading   = $fields['heading'];
            $heading = _s_format_string( $heading, 'h1' );
            $content   = $fields['content'];
                                    
            if( empty( $video_url  ) || empty( $photo ) ) {
                return;     
            }
            
            $video = youtube_embed( $video_url );
            
            $play = sprintf( '<button class="play-video" data-open="modal-video" data-src="%s"><span class="screen-reader-text">Play Video</span>%s</button>', 
                             $video, get_svg( 'youtube-play' ) );
            
            $html = sprintf( '<div class="entry-content caption">%s%s</div><figure>%s%s</figure></div>', $heading, $content, $photo, $play );
                                                                        
            $row = new Element_Row(); 
            
            $column = new Element_Column(); 

            $html = new Element_Html( [ 'fields' => array( 'html' => $html ) ]  ); // set fields from Constructor
            $column->add_child( $html );
                        
            $row->add_child( $column );
                        
            $this->add_child( $row );
        }
        
    }
}
   
new Global_Video_Section;
