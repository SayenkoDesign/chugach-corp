<?php

/*
Section - Portfolio - Map
		
*/


if( ! class_exists( 'Portfolio_Map_Section' ) ) {
    class Portfolio_Map_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();   
            
            $fields = get_field( 'map' );
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
                     $this->get_name() . '-business-lines-map'
                ]
            );
        }
        
        
        private function process_groups() {
            
            
            $rows = $this->get_fields( 'locations' );
            
            $legend = wp_list_pluck( $rows, 'modals' );
            
            $modals = wp_list_pluck( $rows, 'modals' );
            
            if( ! empty( $rows['modals'] ) ) {
                $this->get_modals( $rows['modals'] );
            }
            
            if( empty( $rows ) )
                return false;                                    
                                
            foreach( $rows as $key => $row ):                                         
                
                $heading = $row['heading'];
                $heading  = _s_format_string( $heading, 'h2' );
                $subheading = $row['subheading'];
                $subheading  = _s_format_string( $subheading, 'h2' );
                
                $title = sprintf( '<header>%s%s</header>', $heading, $subheading );
                $thumbnail = _s_get_acf_image( $row['photo'], 'medium' );
                $text = apply_filters( 'the_content', $row['content'] );
                     
                $button = $row['button'];
                if( ! empty( $button ) ) {
                    $button = sprintf( '<p><a href="%s" class="button orange">%s</a></p>', $button['url'], $button['title'] );
                }
                                                        
                ++$i;
                
                $icon = sprintf( '<img src="%sregions/marker.svg" />', trailingslashit( THEME_IMG ) );   
                                        
                $locations .= sprintf( '<button class="marker" id="marker-%s" data-open="regions" data-region="region-%s" style="%s">%s</button>', $i, $i, $xy, $icon );
                $regions .= sprintf( '<div id="region-%s">%s%s%s%s</div>', $i, $title, $thumbnail, $text, $button );
                
                endforeach;
            
            $reveal = '<div class="reveal" id="regions" data-reveal><div class="container"></div><button class="close-button" data-close aria-label="Close reveal" type="button">
    <span aria-hidden="true">&times;</span>
  </button></div>';
            
            return sprintf( '%s<div id="map-box"><div class="map-wrapper">%s<div class="locations">%s</div></div></div><div class="hide">%s</div>%s', 
                            $box, $image, $locations, $regions, $reveal );
                            
        }
        
        
        
        
        private function get_legend() {
            
            $locations = $this->get_fields( 'locations' );
            //return $locations;
            
            $rows = wp_list_pluck( $locations, 'legend' );
            
            if( empty( $rows ) ) {
                return false;
            }
            
            $list = [];
             
            foreach( $rows as $key => $row ) {
                $i = $key + 1;
                $icon  = $row['icon'];
                $title = $row['title'];
                $list[] = sprintf( '<li><button data-open="map" data-modal="map-%s" data-map="#map-%s">%s%s</button></li>', $i, $i, $icon, $title );
            }
            
            if( ! empty( $list ) ) {
                return sprintf( '<div class="legend"><ul>%s</ul></div>', join( '', $list ) );
            }
        }
        
        
        private function get_maps() {
            
            $locations = $this->get_fields( 'locations' );            
            $rows = wp_list_pluck( $locations, 'map' );
            
            if( empty( $rows ) ) {
                return false;
            }
            
            $maps = [];
         
            $maps = array_map( function ( $map ) {
                static $i;
                $i++;
                return sprintf( '<div id="map-%s" class="map">%s</div>', $i, _s_get_acf_image( $map, 'hero' ) );
            }, $rows );
            
            return $maps;
                    
        }
        
        
        // Add content
        public function render() {
                                    
            $map = $this->get_fields( 'default_map' );
            $map = sprintf( '<div id="map-0" class="map parent">%s</div>', _s_get_acf_image( $map, 'hero' ) );
            $maps = sprintf( '<div class="maps">%s%s</div>', join( '', $this->get_maps() ), $map );
            return sprintf( '<div class="row column">%s%s</div>', 
                             $this->get_legend(),
                             $maps
            );
            
            
            
        }
        
    }
}
   
new Portfolio_Map_Section;
