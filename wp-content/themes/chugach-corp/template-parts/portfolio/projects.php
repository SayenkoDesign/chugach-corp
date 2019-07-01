<?php
// Portfolio - Land Resources - Projects

if( ! class_exists( 'Portfolio_Projects_Section' ) ) {
    class Portfolio_Projects_Section extends Element_Section {
                
        private $modals = [];
        
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
            
            return $this->get_grid() . $this->get_modals();
        }
        
        
        public function after_render() {
            
            $anchor_open = '';
            $anchor_close = '';
            $background = '';
            $heading = '';
            $description = '';
            $link = '';            
            
            $field = get_field( 'region' );
                        
            if( ! empty( $field['photo'] ) ) {
                $background = sprintf( '<div class="background" style="background-image: url(%s);"></div>', _s_get_acf_image( $field['photo'], 'large', true ) );
            }
            
            if( ! empty( $field['heading'] ) ) {
                $heading = _s_format_string( $field['heading'], 'h3' );
            }
            
            if( ! empty( $field['description'] ) ) {
                $description = $field['description'];
            }
            
            if( ! empty( $field['link'] ) ) {
                $anchor_open = sprintf( '<a href="%s">', $link );
                $button = '<span></span>';
                $anchor_close = '</a>';
            }
            
            $field = sprintf( '<div class="region"><div class="panel">%s<div class="panel__content">%s%s%s%s%s</div></div></div>',
                                $background,
                                $anchor_open,
                                $heading,
                                $description,
                                $button,
                                $anchor_close
            );
            
            return sprintf( '</div></div></div></div>%s</%s>', $field, esc_html( $this->get_html_tag() ) );
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
            
            $i = $index + 1;
            
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
                        
            $modal = $this->get_modal( $row['modal'], $i );
                                    
            if( ! empty( $modal ) ) {
                $anchor_open = sprintf( '<button data-open="projects" data-project="project-%s">', $i );
                $anchor_close = '</button>';
                $button = sprintf( '<p><span>%s</span></p>', __( 'Learn More', '_s' ) );
            }
                        
            if( $i == 2 ) {
                $video = $this->get_fields( 'video' ); 
                $video_url = _s_get_video_embed( $video );
                $video = sprintf( '<span class="play-video">
                %s<span class="screen-reader-text">Watch Video</span></span>', 
                                get_svg( 'play-hero' ) 
                        );
            }
            
            
            return sprintf( '<div class="column column-block"><div class="panel">%s%s%s<div class="panel__content">%s%s%s%s</div></div></div>',
                            $background,
                            $anchor_open,
                            $anchor_close,
                            $video,
                            $logo,
                            $heading,
                            $button
                            
                            
             );
        }
        
        
        private function get_modal( $row, $index = 0 ) {
                        
            if( empty( $row['heading'] ) || empty( $row['content'] ) ) {
                return false;
            }
                                    
            $heading = $row['heading'];
            $heading  = _s_format_string( $heading, 'h2' );
            $subheading = $row['subheading'];
            $subheading  = _s_format_string( $subheading, 'h3' );
            
            $title = sprintf( '<header>%s%s</header>', $heading, $subheading );
            $thumbnail = _s_get_acf_image( $row['photo'], 'medium' );
            $text = apply_filters( 'the_content', $row['content'] );
                 
            $button = $row['button'];
            if( ! empty( $button ) ) {
                $button = sprintf( '<p><a href="%s" class="button orange">%s</a></p>', $button['url'], $button['title'] );
            }
            
            $video = '';
            
            if( $index == 2 ) {
                $video = $this->get_fields( 'video' ); 
                $args = [];
                if( ! empty( $video ) ) {
                    $video = wp_oembed_get( $video, $args );
                }
                  
            }
            
            return sprintf( '<div id="project-%s">%s%s%s<div class="entry-content">%s%s</div></div>', $index, $title, $video, $thumbnail, $text, $button );
           
        }
        
        private function get_modals() {
            
            $buttons = $this->get_fields( 'buttons' );
            //return $locations;
            
            $rows = wp_list_pluck( $buttons, 'modal' );
            
            if( empty( $rows ) ) {
                return false;
            }
            
            $this->modals = [];
            
            $this->modals = array_map( function ( $row ) {
                static $i;
                $i++;
                
                return $this->get_modal( $row, $i );
                
            }, $rows );
            
            $reveal = '<div class="reveal" id="projects" data-reveal data-v-offset="100"><div class="container"></div>
                    <button class="close-button" data-close aria-label="Close reveal" type="button">
                    <span aria-hidden="true">&times;</span>
                  </button></div>';
            
            return sprintf( '<div class="hide">%s</div>%s', join( '', $this->modals ), $reveal );
        }
        
    }
}
   
new Portfolio_Projects_Section;
