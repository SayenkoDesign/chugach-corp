<?php
// Home - How

if( ! class_exists( 'Home_How_Section' ) ) {
    class Home_How_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                        
            $fields = get_field( 'how' );
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
                     $this->get_name() . '-how'
                ]
            );   
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-how-it-works'
                ], true
            );            
            
        }  
                
       
        
        // Add content
        public function render() {
            
            $fields = $this->get_fields();
                                                 
            $row = new Element_Row(); 
            $column = new Element_Column();    
                            
            // Header
            $header = new Element_Header( [ 'fields' => $fields ] );
            $header->add_render_attribute( 'wrapper', 'class', 'section-title' );
            $column->add_child( $header );
            
            // Editor
            $editor = new Element_Editor( [ 'fields' => $fields ] ); // set fields from Constructor
            $column->add_child( $editor );
            
            $row->add_child( $column );
            $this->add_child( $row );
            
            $row = new Element_Row(); 
            
            $html = $this->grid();
                        
            $html = new Element_Html( [ 'fields' => [ 'html' => $html ] ] ); // set fields from Constructor
            $column = new Element_Column(); 
            $column->add_child( $html );
                        
            $row->add_child( $column );
            
            $this->add_child( $row );
                                         
            
        }
        
        private function grid() {
            
            $rows = $this->get_fields( 'grid' );
            
            if( empty( $rows ) ) {
                return;
            }
                        
            $grid_items = '';
            
            $tag = 'a';
            
            
            if( ! empty( $rows ) ) {
                                
                foreach( $rows as $row ) { 
                    
                    $icon = $row['icon'];  
                    $icon = sprintf( '<span class="icon">%s</span>', _s_get_acf_image( $icon ) ); 
                    
                    $background = $row['background']; 
                    $background = sprintf( 'background-image: url(%s)', _s_get_acf_image_url( $background ) ); 
                    
                    $button = $row['link'];
                    if( ! empty( $button ) ) {
                        $link   = $button['url'];
                        $button = new Element_Link( [ 'fields' => [ 'link' => $button ] ] );
                        $button->set_settings( 'raw', true );
                        $button->add_render_attribute( 'anchor', 'class', [ 'link' ] ); 
                        $button = sprintf( '<p>%s</p>', $button->get_element() );
                    }
                    
                    
                    $thumbnail  = sprintf( '<a href="%s" class="thumbnail" style="%s">%s</a>', $link, $background, $icon ); 
                    
                    $title = sprintf( '<h3><a href="%s">%s</a></h3>', $link, $row['heading'] );  
                   
                    $grid_items .= sprintf( '<div class="column column-block"><div class="grid-item">%s%s%s%s</div></div>', 
                                     $thumbnail, 
                                     $title, 
                                     _s_format_string( $row['description'], 'p', [ 'class' => 'description' ] ),
                                     $button 
                                  );
                }
            }
            
            $chevron_left = sprintf( '<div class="chevron left show-for-large">%s</div>', get_svg( 'chevron-pink' ) );
            $chevron_right = sprintf( '<div class="chevron right show-for-large">%s</div>', get_svg( 'chevron-pink' ) );
            
            return sprintf( '<div class="grid">%s%s<div class="row small-up-1 large-up-3 align-center">%s</div></div>', 
                            $chevron_left,
                            $chevron_right,
                            $grid_items );   
        }
        
    }
}
   
new Home_How_Section;
