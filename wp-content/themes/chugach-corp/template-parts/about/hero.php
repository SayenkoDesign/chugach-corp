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
            
            $background_image       = $this->get_fields( 'background_image' );
            $background_position_x  = $this->get_fields( 'background_position_x' );
            $background_position_y  = strtolower( $this->get_fields( 'background_position_y' ) );
            $background_overlay     = strtolower( $this->get_fields( 'background_overlay' ) );
            
            if( ! empty( $background_image ) ) {
                $background_image = _s_get_acf_image( $background_image, 'hero', true );
                
                $this->add_render_attribute( 'background', 'class', 'background-image' );
                $this->add_render_attribute( 'background', 'style', sprintf( 'background-image: url(%s);', $background_image ) );
                $this->add_render_attribute( 'background', 'style', sprintf( 'background-position: %s %s;', 
                                                                          $background_position_x, $background_position_y ) );
                
                if( true == $background_overlay ) {
                     $this->add_render_attribute( 'background', 'class', 'background-overlay' ); 
                }
                                                                          
            }             
            
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
                    
            $shape = sprintf( '<div class="shape"><img src="%sabout/hero-bottom.png" /></div>', trailingslashit( THEME_IMG ) );
                
            return sprintf( '</div></div></div></div>%s</%s>', $shape , esc_html( $this->get_html_tag() ) );
        }
       
        
        // Add content
        public function render() {
            
            $fields = $this->get_fields();
            
            $heading = empty( $fields['heading'] ) ? '' : _s_format_string( $fields['heading'], 'h1' );
            
            $subheading = empty( $fields['subheading'] ) ? '' : _s_format_string( $fields['subheading'], 'h2' );
            
            $description = empty( $fields['description'] ) ? '' : _s_format_string( $fields['description'], 'p' );
            
            $icon = sprintf( '<div class="icon"><span><img src="%sabout/solidarity.png" /></span></div>', trailingslashit( THEME_IMG ) );
                                               
            if( empty( $heading  ) ) {
                return;     
            }
                        
            $html = sprintf( '<div class="hero-caption"><header>%s%s%s</header>%s</div>', $heading, $icon, $subheading, $description );
                                                                        
            $row = new Element_Row(); 
            $row->add_render_attribute( 'wrapper', 'class', 'align-middle' );
            
            $column = new Element_Column(); 

            $html = new Element_Html( [ 'fields' => array( 'html' => $html ) ]  ); // set fields from Constructor
            $column->add_child( $html );
                        
            $row->add_child( $column );
                        
            $this->add_child( $row );
        }
        
    }
}
   
new Hero_Section;
