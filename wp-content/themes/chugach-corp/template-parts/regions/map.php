<?php

/*
Section - Neighbourhood Map
		
*/



// Add an echo argument so that we can return instead of output

if( ! class_exists( 'Regions_Map_Section' ) ) {
    class Regions_Map_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();   
            
            $fields['map'] = get_field( 'map' );
            $fields['map_no_pins'] = get_field( 'map_no_pins' );
            $fields['locations'] = get_field( 'locations' );
            $this->set_fields( $fields );
            
            // Render the section
            $this->render();
                       
            $this->print_element();       
        }
              
        // Add default attributes to section        
        protected function _add_render_attributes() {
            
            // use parent attributes
            parent::_add_render_attributes();
    
            $this->add_render_attribute(
                'wrapper', 'class', [
                     $this->get_name() . '-regions-map'
                ]
            );
        }
        
        
        public function after_render() {
            
            $anchor_open = '';
            $anchor_close = '';
            $background = '';
            $heading = '';
            $description = '';
            $link = '';            
            
            $field = get_field( 'project' );
                        
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
            
            $field = sprintf( '<div class="project"><div class="panel">%s<div class="panel__content">%s%s%s%s%s</div></div></div>',
                                $background,
                                $anchor_open,
                                $heading,
                                $description,
                                $button,
                                $anchor_close
            );
            
            return sprintf( '</div></div></div></div>%s</%s>', $field, esc_html( $this->get_html_tag() ) );
        }
        
        
        public function get_map_box() {
            
            $map         = $this->get_fields( 'map' );
            $map_no_pins = $this->get_fields( 'map_no_pins' );
            
            if( empty( $map ) ) {
                return false;
            }
                        
            $show_pins = true;
            
            if( is_user_logged_in() ) {
                $show_pins = false;
            }  else {
                $map = $map_no_pins;
            }
            
            $size = 'full';
            
            $image = wp_get_attachment_image( $map, $size, '', array( 'class' => 'location-map') );
            
            $box = '';          
            $locations = '';
            $regions = '';
            
            if( $show_pins ) {
                                
                $rows = $this->get_fields( 'locations' );
                                                
                $i = 0;
                                
                if( ! empty( $rows ) ):
                                                    
                    foreach( $rows as $key => $row ):
                        
                        if( empty( $row['coordinates'] ) ) {
                            continue;
                        }
                        
                        list($x, $y) = explode('/', $row['coordinates'] );   
                        
                        //$offsetx = $row['offset_x'] * 1;
                        //$offsety = $row['offset_y'] * 1;
                        
                        // data-v-offset  data-h-offset
                        
                        $x = $x . '%';     
                                
                        $y = $y . '%';
                                    
                        $xy = sprintf("left:%s; top:%s;", $x, $y );                                             
                        
                        $post_id = $row['region'];
                        $title = get_the_title( $post_id );
                        $label = sprintf( '<span class="label">%s</span>', $title ); 
                        $title  = _s_format_string( $title, 'h2' );
                        $subtitle = get_field( 'subtitle', $post_id );
                        $subtitle  = _s_format_string( $subtitle, 'h3' );
                        $title = sprintf( '<header>%s%s</header>', $title, $subtitle );
                        $thumbnail = get_the_post_thumbnail( $post_id, 'medium' );
                        $text = apply_filters( 'the_content', get_post_field( 'post_content', $post_id ) );
                             
                        $button = get_field( 'button', $post_id );
                        if( ! empty( $button ) ) {
                            $button = sprintf( '<p><a href="%s" class="button orange">%s</a></p>', $button['url'], $button['title'] );
                        }
                                                                
                        ++$i;
                        
                        $icon = sprintf( '<img src="%sregions/marker.svg" />', trailingslashit( THEME_IMG ) );  
                        
                                                
                        $locations .= sprintf( '<button class="marker" id="marker-%s" data-open="regions" data-region="region-%s" style="%s">%s%s</button>', $i, $i, $xy, $label, $icon );
                        $regions .= sprintf( '<div id="region-%s">%s%s%s%s</div>', $i, $title, $thumbnail, $text, $button );
            
                    endforeach;
                endif;
            }
            else {
                $box = sprintf('<div class="mouse-xy"><div class="row"><div class="small-12 columns"><label>Click on map, then copy map coordinates. Make sure to click the very bottom of the icon.</label><input id="mouse-xy" type="text" placeholder="Map Coordinates"></div></div></div>');   
            }
            
            $reveal = '<div class="reveal" id="regions" data-reveal><div class="container"></div><button class="close-button" data-close aria-label="Close reveal" type="button">
    <span aria-hidden="true">&times;</span>
  </button></div>';
            
            return sprintf( '%s<div id="map-box"><div class="map-wrapper">%s<div class="locations">%s</div></div></div><div class="hide">%s</div>%s', 
                            $box, $image, $locations, $regions, $reveal );
                            
        }
        
        
        
        
        function get_map_key() {
            
            if( is_user_logged_in() ) {
                return false;   
            }
		                        
            $locations = array();
                
            $rows = get_field('locations');	
                                        
            if( empty( $rows ) )
                return;
            
            $list = '';
            
            $i = 0;
            		
            foreach( $rows as $key => $row ):
                if( empty( $row['coordinates'] ) ) {
                    continue;
                }
                
                ++$i;
                
                $post_id = $row['region'];
                $list .= sprintf('<li><button data-open="regions" data-region="region-%s" data-marker="#marker-%s">%s</button></li>', $i, $i, get_the_title( $post_id ) );
            endforeach;
            
            if( ! empty( $list ) ) {
                return sprintf( '<div class="map-key"><div class="wrap"><ul>%s</ul></div></div>', $list );
            }
                        
        }
        
        
        // Add content
        public function render() {
                                    
            return sprintf( '%s%s', 
                            $this->get_map_key(), $this->get_map_box() );
            
        }
        
    }
}
   
new Regions_Map_Section;
