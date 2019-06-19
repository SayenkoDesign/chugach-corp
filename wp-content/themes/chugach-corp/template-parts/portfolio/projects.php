<?php
// Portfolio - Land Resources - Projects

if( ! class_exists( 'Portfolio_Projects_Section' ) ) {
    class Portfolio_Projects_Section extends Element_Section {
                
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'projects' );
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
                     $this->get_name() . '-projects'
                ]
            ); 
            
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-projects'
                ]
            ); 
        } 
               
        
        // Add content
        public function render() {
            return $this->get_grid();
        }
        
        
        public function after_render() {
            
            $anchor_open = '';
            $anchor_close = '';
            $background = '';
            $heading = '';
            $description = '';
            $link = '';            
            
            $region = get_field( 'region' );
                        
            if( ! empty( $region['photo'] ) ) {
                $background = sprintf( '<div class="background" style="background-image: url(%s);"></div>', _s_get_acf_image( $region['photo'], 'large', true ) );
            }
            
            if( ! empty( $region['heading'] ) ) {
                $heading = _s_format_string( $region['heading'], 'h3' );
            }
            
            if( ! empty( $region['description'] ) ) {
                $description = $region['description'];
            }
            
            if( ! empty( $region['link'] ) ) {
                $anchor_open = sprintf( '<a href="%s">', $link );
                $button = '<span></span>';
                $anchor_close = '</a>';
            }
            
            $region = sprintf( '<div class="region"><div class="panel">%s<div class="panel__content">%s%s%s%s%s</div></div></div>',
                                $background,
                                $anchor_open,
                                $heading,
                                $description,
                                $button,
                                $anchor_close
            );
            
            return sprintf( '</div></div></div></div>%s</%s>', $region, esc_html( $this->get_html_tag() ) );
        }
        
        
        private function get_grid() {
             $rows =  $this->get_fields( 'buttons' );  
             
             if( empty( $rows ) ) {
                 return false;
             }
             
             $columns = [];
             
             foreach( $rows as $index => $row ) {
                 $columns[] = $this->get_column( $row, $index );
             }
             
             if( ! empty( $columns ) ) {
                 return sprintf( '<div class="row small-up-1 medium-up-2 large-up-3 align-center grid">%s</div>', join( '', $columns ) );
             }
        }
        
        
        private function get_column( $row = [], $index = 0 ) {
            
            $background = '';
            $video = '';
            $anchor_open = '';
            $anchor_close = '';
            $button = '';
            
            $photo = $row['photo'];
            if( ! empty( $photo ) ) {
                $background = sprintf( '<div class="background" style="background-image: url(%s);"></div>', _s_get_acf_image( $photo, 'large', true ) );
            }
            
            $logo = $row['logo'];
            $logo = _s_get_acf_image( $logo, 'medium' );
            $heading = _s_format_string( $row['heading'], 'h3' );
            $link = $row['link'];
            
            if( ! empty( $link ) ) {
                $anchor_open = sprintf( '<a href="%s">', $link );
                $anchor_close = '</a>';
                $button = sprintf( '<p><span>%s</span></p>', __( 'Learn More', '_s' ) );
            }
                        
            if( $index == 1 ) {
                $video = $this->get_fields( 'video' ); 
                $video_url = _s_get_video_embed( $video );
                $video = sprintf( '<button class="play-video" data-open="modal-video" data-src="%s">
                %s<span class="screen-reader-text">Watch Video</span></button>', 
                                $video_url, 
                                get_svg( 'play-hero' ) 
                        );
            }
            
            
            return sprintf( '<div class="column column-block"><div class="panel">%s<div class="panel__content">%s%s%s%s%s%s</div></div></div>',
                            $background,
                            $video,
                            $anchor_open,
                            $logo,
                            $heading,
                            $button,
                            $anchor_close
                            
             );
        }
        
    }
}
   
new Portfolio_Projects_Section;
