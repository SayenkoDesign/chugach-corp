<?php
// Portfolio - Land Resources - Projects

if( ! class_exists( 'Portfolio_Section' ) ) {
    class Portfolio_Section extends Element_Section {
                
        public function __construct() {
            parent::__construct();
            
            $fields = get_field( 'portfolio' );
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
                     $this->get_name() . '-portfolio'
                ]
            ); 
            
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-portfolio'
                ]
            ); 
        } 
               
        
        // Add content
        public function render() {
            return $this->get_grid();
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
            
            $background = '';
            $anchor_open = '<div class="panel">';
            $anchor_close = 'div';
            
            $photo = $row['photo'];
            if( ! empty( $photo ) ) {
                $background = sprintf( '<div class="background" style="background-image: url(%s);"></div>', _s_get_acf_image( $photo, 'large', true ) );
            }

            $link = $row['link'];
            
            if( ! empty( $link ) ) {
                $anchor_open = sprintf( '<a class="panel" href="%s">', $link['url'] );
                $anchor_close = '</a>';
                $button = sprintf( '<h3>%s</h3>', $link['title'] );
            }
            
            return sprintf( '<div class="column column-block">%s%s<div class="panel__content">%s</div>%s</div>',
                            $anchor_open,
                            $background,
                            $button,
                            $anchor_close
                            
             );
        }
        
    }
}
   
new Portfolio_Section;
