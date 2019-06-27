<?php
// Culture - Information

if( ! class_exists( 'Culture_Information_Section' ) ) {
    class Culture_Information_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'information' );
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
                     $this->get_name() . '-information',
                ]
            ); 
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-information',
                ],
                true
            ); 
                        
        }  
        
        
        
        // Add content
        public function render() {
            
            $fields = $this->get_fields();  
                                                                
            $heading    = $this->get_fields( 'heading' ) ? $this->get_fields( 'heading' ) : 'Information';
            $heading    = _s_format_string( $heading, 'h2' );
            
            $subheading = empty( $this->get_fields( 'subheading' ) ) ? '' : sprintf( '%s', _s_format_string( $this->get_fields( 'subheading' ), 'h3' ) );
            
            $heading = sprintf( '<div class="column row"><header>%s%s</header></div>', 
                                $heading, $subheading );
            
            $columns = [];                    
            
            $photo = $this->get_fields( 'photo' );
            if( ! empty( $photo ) ) {
                
                $columns[] = sprintf( '<div class="column column-block small-12 large-3"><div class="photo">%s</div></div>',  
                                  _s_get_acf_image( $photo ) );
            }
            
            $listen = $this->get_listen();
            if( ! empty( $listen) ) {
                $columns[] = sprintf( '<div class="column column-block small-12 large-5"><h3>%s</h3>%s</div>',  
                                      __( 'Listen', '_s' ),
                                      $listen 
                                      );
            }
            
            $read = $this->get_read();
            if( ! empty( $read) ) {
                $columns[] = sprintf( '<div class="column column-block small-12 large-4"><h3>%s</h3>%s</div>',  
                                      __( 'Read', '_s' ),
                                      $read 
                                      );
            }
            
            return sprintf( '%s<div class="row information">%s</div>', $heading, join( '', $columns ) );
            
        }
        
        private function get_listen() {
            $rows = $this->get_fields( 'listen' ); 
            if( empty( $rows ) ) {
                return false;
            }
            $out = '';
            
            $args = [ 'width' => '1000', 'height' => '150' ];
            
            foreach( $rows as $row ) {
                $out .= wp_oembed_get( $row['soundcloud'], $args );               
            }
            
            return $out;
        }
        
        
        private function get_read() {
            $rows = $this->get_fields( 'read' ); 
            if( empty( $rows ) ) {
                return false;
            }
            
            $list = [];
            
            foreach( $rows as $row ) {
                $link = $row['link'];
                if( ! empty( $link['url'] ) && ! empty( $link['title'] ) ) {
                    $list[] = sprintf( '<a href="%s">%s</a>', $link['url'], $link['title'] );
                }
            }
            
            return sprintf( '<div class="ul-expand">%s<span><a>[+] expand section</a></span></div>', ul( $list, [ 'class' => 'no-bullet' ] ) );
        }
        
    }
}
   
new Culture_Information_Section;
