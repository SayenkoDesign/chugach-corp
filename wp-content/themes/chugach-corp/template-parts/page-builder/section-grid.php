<?php
// :Page Builder - Grid

if( ! class_exists( 'Page_Builder_Grid_Section' ) ) {
    class Page_Builder_Grid_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                        
            $fields = get_sub_field( 'grid' );
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
                     $this->get_name() . '-grid'
                ]
            );            
            
        }  
       
        
        // Add content
        public function render() {
            
            $fields = $this->get_fields();
                                                
            $row = new Element_Row(); 
            
            $column = new Element_Column(); 
          
            // Editor
            $header = new Element_Header( [ 'fields' => $fields ]  ); // set fields from Constructor
            $column->add_child( $header );
            $row->add_child( $column );
            $this->add_child( $row );
            
            $grid = $this->get_fields( 'grid' );
                        
            $grid_items = [];
                        
            if( ! empty( $grid ) ) {
                
                foreach( $grid as $item ) {
                    
                    $title = _s_format_string( $item['grid_title'], 'h3' );
                    
                    $thumbnail = sprintf( '<div class="icon">%s</div>', _s_get_acf_image( $item['grid_photo'], 'icon-medium' ) );
                                                                     
                    $grid_items[] = sprintf( '<div class="grid-item"><div class="panel align-middle">%s%s</div></div>', $thumbnail, $title );
                }
                
                $odd = array();
                $even = array();
                foreach ($grid_items as $k => $v) {
                    if ($k % 2 == 0) {
                        $even[] = $v;
                    }
                    else {
                        $odd[] = $v;
                    }
                }
                
                $mobile = sprintf( '<div class="column row show-for-small-only">%s%s</div>', 
                                  join( '', $even ), join( '', $odd ) );
                                
                $grid = sprintf( '<div class="row medium-up-2 show-for-medium align-middle">%s</div>', 
                                  '<div class="column column-block">' . implode( '</div><div class="column column-block">', $grid_items ) . '</div>' );
            
                
                $row = new Element_Row(); 
                $column = new Element_Column(); 
            
                $html = new Element_Html( [ 'fields' => [ 'html' => $mobile . $grid ] ] ); // set fields from Constructor
                $column->add_child( $html );
                            
                $row->add_child( $column );
                            
                $this->add_child( $row );
            }
            
            
        }
        
        private function array_partition( $array, $number_of_columns ) {
            
            if( empty( $array ) ) {
                return false;
            }
                        
            $number_of_columns = (int) $number_of_columns;
            $arraylen = count( $array );
            $partlen = floor( $arraylen / $number_of_columns );
            $partrem = $arraylen % $number_of_columns;
            $partition = array();
            $mark = 0;
            for ( $px = 0; $px < $number_of_columns; $px++ ) {
                $incr = ($px < $partrem) ? $partlen + 1 : $partlen;
                $partition[$px] = array_slice( $array, $mark, $incr );
                $mark += $incr;
            }
            return $partition;
        }
        
        private function create_columns( $array_value = '' ) {
            if( ! empty( $array_value ) ) {
                return sprintf( '<div class="column">%s</div>', join( '', $array_value ) );
            }
        }
        
    }
}
   
new Page_Builder_Grid_Section;
