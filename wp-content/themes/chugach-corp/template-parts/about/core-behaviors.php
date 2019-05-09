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
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-core-behaviors'
                ]
            );
            
            $this->add_render_attribute(
                'wrapper', 'data-toggler', '.slider-show' );
                                    
            $background_image       = $this->get_fields( 'background_image' );
            $background_position_x  = strtolower( $this->get_fields( 'background_position_x' ) );
            $background_position_y  = strtolower( $this->get_fields( 'background_position_y' ) );
            
            if( ! empty( $background_image ) ) {
                $background_image = _s_get_acf_image( $background_image, 'hero', true );
                $this->add_render_attribute( 'wrapper', 'class', 'background-image' );
                $this->add_render_attribute( 'wrapper', 'style', sprintf( 'background-image: url(%s);', $background_image ) );
                $this->add_render_attribute( 'wrapper', 'style', sprintf( 'background-position: %s %s;', 
                                                                          $background_position_x, $background_position_y ) );
            } 
            
        } 
        
        
        public function before_render() {            
            
            $this->add_render_attribute( 'wrap', 'class', 'wrap' );
            
            return sprintf( '<%s %s><div %s>', 
                            esc_html( $this->get_html_tag() ), 
                            $this->get_render_attribute_string( 'wrapper' ), 
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
            return sprintf( '</div></%s>', esc_html( $this->get_html_tag() ) );
        }
              
        
        // Add content
        public function render() {
            
            $fields = $this->get_fields();
                                                             
            $row = new Element_Row(); 
                                        
            // Header
            $icon       = sprintf( '<span class="icon"><img src="%swho-we-are/icons/core-behaviors.svg" /></span>', trailingslashit( THEME_IMG ) );  
            $heading    = $this->get_fields( 'heading' ) ? $this->get_fields( 'heading' ) : 'Core Behaviors';
            $heading    = sprintf( '<header>%s%s</header>', 
                                       $icon,
                                       _s_format_string( $heading, 'h2' ) );
            
            $subheading = empty( $this->get_fields( 'subheading' ) ) ? '' : sprintf( '%s', _s_format_string( $this->get_fields( 'subheading' ), 'h3' ) );
            
            $button = '<button class="close-slider" data-toggle="section-core-behaviors"><span class="screen-reader-text">close</span></button>';
            
            $content = sprintf( '<div class="row large-unstack"><div class="column column-block shrink">%s</div><div class="column column-block">%s</div>%s</div>', 
                                $heading, $subheading, $button );
            
            $grid = $this->grid();
                        
            return $content . $grid;
                                         
            
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
                   
                    $grid_items .= sprintf( '<div class="column column-block"><div class="grid-item" data-toggle="section-core-behaviors">%s%s</div></div>', 
                                     $icon, $heading );
                }
            }
            
            return sprintf( '<div class="clearfix">%s<div class="grid" id="grid"><div class="row small-up-2 medium-up-3 large-up-5 align-center">%s</div></div></div>', 
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
                   
                    $grid_items .= sprintf( '<div><div class="slide-content">%s%s%s</div></div>', 
                                     $icon, $heading, $description );
                }
            }
            
            return sprintf( '<div class="slider" id="slider"><div class="slick">%s</div></div>', $grid_items );  
        }
        
    }
}
   
new About_Core_Behaviors_Section;
