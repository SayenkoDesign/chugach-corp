<?php
// Culture - Gallery

if( ! class_exists( 'Culture_Gallery_Section' ) ) {
    class Culture_Gallery_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'gallery' );
            $this->set_fields( $fields );
                                    
            // Render the section
            if( empty( $this->render() ) ) {   
                return;
            }
            
            // print the section
            $this->print_element();        
        }
        
              
        // Add default attributes to section        
        protected function _add_render_attributes() {
            
            // use parent attributes
            parent::_add_render_attributes();
    
            $this->add_render_attribute(
                'wrapper', 'class', [
                     $this->get_name() . '-gallery',
                ]
            ); 
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-gallery',
                ],
                true
            ); 
                        
        }  
        
        
        
        // Add content
        public function render() {
            
                        
            $heading    = 'Gallery';
            $heading    = sprintf( '<div class="column row"><header>%s</header></div>', 
                                       _s_format_string( $heading, 'h2' ) );
            $rows = $this->get_fields();  
            if( empty( $rows ) ) {
                return false;
            }
            
            $gallery = [];
            
            foreach( $rows as $row ) {
                $thumbnail = _s_get_acf_image( $row['id'], 'medium' );
                $background = _s_get_acf_image( $row['id'], 'medium', true );
                $large = _s_get_acf_image( $row['id'], 'large', true );
                $caption = $row['caption'];
                if( $caption ) {
                    $caption  = sprintf( ' data-sub-html="%s"', esc_attr( $caption ) );
                }
                
                if( $large ) {
                    $background = sprintf( '<div class="thumbnail" style="background-image: url(%s);"></div>', $background );
                    $gallery[] = sprintf( '<div class="column column-block" data-src="%s"%s>%s%s</div>', 
                                        $large,
                                        $caption,
                                        $background,
                                        $thumbnail
                    );
                }
                
            }
                        
            return sprintf( '%s<div id="light-gallery" class="row small-up-2 medium-up-3 large-up-4">%s</div>', 
                                $heading, join( '', $gallery ) );
            
        }
        
    }
}
   
new Culture_Gallery_Section;
