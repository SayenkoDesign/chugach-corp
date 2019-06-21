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
                $icon = _s_get_acf_image( $icon );
                $title = $row['title'];
                $list[] = sprintf( '<li><button data-open="maps" data-content="map-content-%s" data-map="#map-%s">%s%s</button></li>', $i, $i, $icon, $title );
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
        
        
        private function get_modals() {
            
            $locations = $this->get_fields( 'locations' );
            //return $locations;
            
            $rows = wp_list_pluck( $locations, 'modal' );
            
            if( empty( $rows ) ) {
                return false;
            }
            
            $modals = [];
            
            $modals = array_map( function ( $row ) {
                static $i;
                $i++;
                
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
                
                return sprintf( '<div id="map-content-%s">%s%s%s%s</div>', $i, $title, $thumbnail, $text, $button );
            }, $rows );
            
            return sprintf( '<div class="hide">%s</div>', join( '', $modals ) );
        }
        
        
        // Add content
        public function render() {
                                    
            $map = $this->get_fields( 'default_map' );
            $map = sprintf( '<div id="map-0" class="map parent">%s</div>', _s_get_acf_image( $map, 'hero' ) );
            $maps = sprintf( '<div class="maps">%s%s</div>', join( '', $this->get_maps() ), $map );
            
            $reveal = '<div class="reveal" id="maps" data-reveal><div class="container"></div><button class="close-button" data-close aria-label="Close reveal" type="button">
    <span aria-hidden="true">&times;</span>
  </button></div>';
            
            return sprintf( '<div class="row column">%s%s</div>%s%s', 
                             $this->get_legend(),
                             $maps,
                             $this->get_modals(),
                             $reveal
            );
            
            
            
        }
        
    }
}
   
new Portfolio_Map_Section;
