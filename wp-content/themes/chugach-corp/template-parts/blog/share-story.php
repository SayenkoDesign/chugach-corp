<?php

/*
Blog - Share-story
*/


if( ! class_exists( 'Share_Story' ) ) {
    class Share_Story extends Element_Section {
        
        public function __construct() {
            parent::__construct();
            
            $post_id = get_option('page_for_posts');
            $fields = get_field( 'share_stories', $post_id );            
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
                     $this->get_name() . '-share-story', 'show-for-large'
                ]
            );            
        } 
        
        
       
           
        
        // Add content
        public function render() {
            
            $photos  = $this->get_fields( 'photos' );  
                        
            if( empty( $photos ) ) {
                return false;
            }
            
            $grid = '';
            
            foreach( $photos as $photo ) {
                $background = sprintf( 'style="background-image: url(%s);"', _s_get_acf_image_url( $photo['ID'] ) );
                $grid .= sprintf( '<div class="grid-item"><div class="background" %s></div></div>', $background );             
            }
            
            $grid = sprintf( '<div class="grid">%s</div>', $grid );
                        
            $heading        = $this->get_fields( 'heading' );
            $heading        = _s_format_string( $heading, 'h2' );
            
            $description    = $this->get_fields( 'description' );
            $description    = _s_format_string( $description, 'p' );
            
            $hashtag        = $this->get_fields( 'hashtag' );
            $hashtag    = _s_format_string( $hashtag, 'h3' );
            
            return sprintf( '<div class="row expanded collapse"><div class="column">%s</div><div class="column"><div class="entry-content align-self-middle">%s%s%s</div></div></div>', 
                            $grid,
                            $heading, 
                            $description, 
                            $hashtag 
                         );            
        }        
        
    }
}
   
new Share_Story; 