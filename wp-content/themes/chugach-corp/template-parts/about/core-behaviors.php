<?php
// About - Core Behaviours

if( ! class_exists( 'About_Core_Behaviors_Section' ) ) {
    class About_Core_Behaviors_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                        
            $fields = get_field( 'core_behaviors' );
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
                     $this->get_name() . '-core-behaviors'
                ]
            );
                        
            $background_image       = $this->get_fields( 'background_image' );
            $background_position_x  = strtolower( $this->get_fields( 'background_position_x' ) );
            $background_position_y  = strtolower( $this->get_fields( 'background_position_y' ) );
            
            if( ! empty( $background_image ) ) {
                $background_image = _s_get_acf_image( $background_image, 'hero', true );
                $this->add_render_attribute( 'wrapper', 'style', sprintf( 'background-image: url(%s);', $background_image ) );
                $this->add_render_attribute( 'wrapper', 'style', sprintf( 'background-position: %s %s;', 
                                                                          $background_position_x, $background_position_y ) );
            } 
            
        }       
        
        // Add content
        public function render() {
            
            $fields = $this->get_fields();
                                                             
            $row = new Element_Row(); 
                                        
            // Header
            $header = new Element_Header( [ 'fields' => $fields ] );
            $column = new Element_Column(); 
            $column->add_render_attribute( 'wrapper', 'class', 'text-center' );
            $column->add_child( $header );
            
            $row->add_child( $column );
            $this->add_child( $row );
            
            $row = new Element_Row(); 
            $row->add_render_attribute( 'wrapper', 'class', 'large-collapse' );
            
            $html = $this->grid();
                        
            $html = new Element_Html( [ 'fields' => [ 'html' => $html ] ] ); // set fields from Constructor
            $column = new Element_Column(); 
            $column->add_child( $html );
                        
            $row->add_child( $column );
            
            $this->add_child( $row );
                                         
            
        }
        
        private function grid() {
            
            $rows = $this->get_fields( 'grid' );
            
            $grid_items = '';
            
            $tag = 'div';
            
            
            if( ! empty( $rows ) ) {
                                
                foreach( $rows as $row ) {     
                    
                    $icon = $row['icon'];
                    $icon = sprintf( '<div class="icon">%s</div>', _s_get_acf_image( $icon, 'icon-large' ) );
                    $heading = _s_format_string( $row['heading'], 'h4' ); 
                   
                    $grid_items .= sprintf( '<div class="column column-block"><div class="grid-item" data-toggle="grid slider">%s%s</div></div>', 
                                     $icon, $heading );
                }
            }
            
            return sprintf( '%s<div class="grid" id="grid" data-toggler=".grid-hide"><div class="row small-up-2 medium-up-2 large-up-4 align-center">%s</div></div>', 
                            $this->slick_slider(),
                            $grid_items
                          );   
        }
        
        private function slick_slider() {
            
            $rows = $this->get_fields( 'grid' );
            
            $grid_items = '';            
            
            if( ! empty( $rows ) ) {
                                
                foreach( $rows as $row ) {     
                    
                    $icon = $row['icon'];
                    $icon = sprintf( '<div class="icon">%s</div>', _s_get_acf_image( $icon, 'icon-large' ) );
                    $heading = _s_format_string( $row['heading'], 'h4' ); 
                    $description = $row['description'];   
                   
                    $grid_items .= sprintf( '<div>%s%s%s</div>', 
                                     $icon, $heading, $description );
                }
            }
            
            return sprintf( '<div class="slider" id="slider" data-toggler=".slider-show"><button class="close-slider" data-toggle="slider grid">&times;</button><div class="slick">%s</div></div>', $grid_items );  
        }
        
    }
}
   
new About_Core_Behaviors_Section;
