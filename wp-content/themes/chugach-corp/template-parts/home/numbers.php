<?php
// Home - Numbers

if( ! class_exists( 'Home_Numbers_Section' ) ) {
    class Home_Numbers_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                        
            $fields = get_field( 'numbers' );
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
                     $this->get_name() . '-numbers'
                ]
            );            
            
        }

        
        // Add content
        public function render() {
            
            $fields = $this->get_fields();
                                                 
            $row = new Element_Row(); 
            $row->add_render_attribute( 'wrapper', 'class', 'large-unstack align-middle' );
            
            $column = new Element_Column(); 
            $column->add_render_attribute( 'wrapper', 'class', 'column-block' );
            $column->add_render_attribute( 'wrapper', 'class', ['shrink' ] );
            $html = sprintf( '<span><img src="%shome/by-the-numbers-graphic.png" /></span>', 
                                       trailingslashit( THEME_IMG ) );
            $html = new Element_HTML( [ 'fields' => ['html' => $html] ] ); // set fields from Constructor
            $column->add_child( $html ); 
            $row->add_child( $column );
                                        
            // Header
            $header = new Element_Header( [ 'fields' => $fields ] );
            $column = new Element_Column(); 
            $column->add_child( $header );
            $row->add_child( $column );
            
            $this->add_child( $row );
                        
            $row = new Element_Row(); 
            $row->add_render_attribute( 'wrapper', 'class', 'large-collapse' );
            
            $html = $this->grid();
                        
            $html = new Element_Html( [ 'fields' => [ 'html' => $html ] ] ); // set fields from Constructor
            
            
            $this->add_child( $html );
                                         
            
        }
        
        private function grid() {
            
            $rows = $this->get_fields( 'numbers' );
            
            $grid_items = '';
            
            $tag = 'div';
            
            
            if( ! empty( $rows ) ) {
                                
                foreach( $rows as $row ) {     
                                    
                    $number = _s_format_string( $row['number'], 'span' ); 
                    $symbol =   $row['symbol'];     
                    $name = $row['name']; 
                    $description = _s_format_string( $row['description'], 'p' );    
                   
                    $grid_items .= sprintf( '<div class="column column-block"><%1$s class="grid-item"><header><h4 class="align-middle"><div class="count animate-numbers">%2$s%3$s</div><div class="description">%4$s</div></h4></header>%5$s</%1$s></div>', 
                                     $tag, $number, $symbol, $name, $description );
                }
            }
            
            return sprintf( '<div class="grid"><div class="row small-up-1 medium-up-2 large-up-4 align-center">%s</div></div>', $grid_items );   
        }
        
    }
}
   
new Home_Numbers_Section;
