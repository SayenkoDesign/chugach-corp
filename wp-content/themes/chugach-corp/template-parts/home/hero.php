<?php
// Home - Hero

if( ! class_exists( 'Hero_Section' ) ) {
    class Hero_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                        
            $fields = get_field( 'hero' );
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
                     $this->get_name() . '-hero',
                     $this->get_name() . '-hero' . '-' . $this->get_id(),
                ]
            ); 
                        
        }  
        
        
        public function before_render() {
         
            $background_video       = $this->get_fields( 'background_video' );
            $background_image       = $this->get_fields( 'background_image' );
            $background_position_x  = $this->get_fields( 'background_position_x' );
            $background_position_y  = strtolower( $this->get_fields( 'background_position_y' ) );
            $background_overlay     = strtolower( $this->get_fields( 'background_overlay' ) );
            
            if( ! wp_is_mobile() && ! empty( $background_video ) ) {
                
                $this->add_render_attribute( 'background', 'class', 'background-video' );
                
                $args = [ 'autoplay' => 'true', 'muted' => 'true', 'loop' => 'true' ];
                                                                
                $source = sprintf( '<source src="%s" type="video/%s">', $background_video,  pathinfo( $background_video, PATHINFO_EXTENSION ) );
                                                
                if( ! empty( $background_image ) ) {
                    $background_image = _s_get_acf_image( $background_image, 'hero', true );
                    $args['poster'] = $background_image;
                    $args['preload'] = 'none';
                    $background_image = _s_get_acf_image( $background_image, 'hero', true );
                    $this->add_render_attribute( 'wrapper', 'class', 'has-background' );
                    $this->add_render_attribute( 'background', 'class', 'background-image' );
                    $this->add_render_attribute( 'background', 'style', sprintf( 'background-image: url(%s);', $background_image ) );
                    $this->add_render_attribute( 'background', 'style', sprintf( 'background-position: %s %s;', 
                                                                              $background_position_x, $background_position_y ) );
                                                                              
                }
                
                $attributes = _parse_data_attribute( $args );
              
                $video = sprintf( '<video %s>%s</video>', $attributes, $source );
                
            } else if( ! empty( $background_image ) ) {
                $background_image = _s_get_acf_image( $background_image, 'hero', true );
                
                $this->add_render_attribute( 'wrapper', 'class', 'has-background' );
                $this->add_render_attribute( 'background', 'class', 'background-image' );
                $this->add_render_attribute( 'background', 'style', sprintf( 'background-image: url(%s);', $background_image ) );
                $this->add_render_attribute( 'background', 'style', sprintf( 'background-position: %s %s;', 
                                                                          $background_position_x, $background_position_y ) );
                                                                          
            } 
            
            
            $this->add_render_attribute( 'inner', 'class', 'inner' );
            $this->add_render_attribute( 'container', 'class', 'container' );
            $this->add_render_attribute( 'wrap', 'class', 'wrap' );
            
            return sprintf( '<%s %s><div %s><div %s>%s</div><div %s><div %s>', 
                            esc_html( $this->get_html_tag() ), 
                            $this->get_render_attribute_string( 'wrapper' ), 
                            $this->get_render_attribute_string( 'inner' ), 
                            $this->get_render_attribute_string( 'background' ),
                            $video,
                            $this->get_render_attribute_string( 'container' ), 
                            $this->get_render_attribute_string( 'wrap' )
                            );
            
        }
        
            
        /**
         * After section rendering.
         *
         * Used to add stuff after the section element.
         *
         * @since 1.0.0
         * @access public
         */
        public function after_render() {
            
            $scroll = sprintf( '<span class="scroll-next">%s</span>', get_svg( 'arrow-down' ) );
            $shape = sprintf( '%s<div class="shape"><img src="%sglobal/hero-bottom.png" /></div>', $scroll, trailingslashit( THEME_IMG ) );
            
            $photos = $this->get_fields( 'photos' );
            $gallery = '';
            if( ! empty( $photos ) ) {
                foreach( $photos as $key => $photo ) {
                    $gallery .= sprintf( '<div class="photo-%s" style="background-image: url(%s)"></div>', 
                                          $key, _s_get_acf_image( $photo['ID'], 'thumbnail', true ) );
                }
                
                if( ! empty( $gallery ) ) {
                    $gallery = sprintf( '<div class="column row row-2 show-for-xxlarge"><div class="photos">%s</div></div>', 
                                        $gallery 
                                        );
                }
            }
                
            return sprintf( '</div>%s</div></div>%s%s</%s>', $scroll, $shape , $gallery, esc_html( $this->get_html_tag() ) );
        }
       
        
        // Add content
        public function render() {
            
            $fields = $this->get_fields();
            
            $heading = empty( $fields['heading'] ) ? '' : _s_format_string( $fields['heading'], 'h1' );
            $subheading = empty( $fields['subheading'] ) ? '' : _s_format_string( $fields['subheading'], 'h3' );
             
            $video = empty( $fields['video'] ) ? '' : $fields['video']; 
                                               
            if( empty( $heading  ) ) {
                return;     
            }
            
            $classes = '';
            
            if( !empty( $video ) ) {
                $video_url = _s_get_video_embed( $video );
                $classes = ' has-video';
                $video = sprintf( '<div class="hero-buttons"><button class="play-video" data-open="modal-video" data-src="%s">%s<span class="screen-reader-text">Watch Video</span></button></div>', 
                                $video_url, 
                                get_svg( 'play-hero' ) 
                        );
            }
                                    
            $html = sprintf( '<div class="hero-content%s"><header>%s%s</header>%s</div>', $classes, $heading, $subheading, $video );
                                                                        
            $row = new Element_Row(); 
            $row->add_render_attribute( 'wrapper', 'class', '' );
            
            $column = new Element_Column(); 

            $html = new Element_Html( [ 'fields' => array( 'html' => $html ) ]  ); // set fields from Constructor
            $column->add_child( $html );
                        
            $row->add_child( $column );
                        
            $this->add_child( $row );
        }
        
    }
}
   
new Hero_Section;
