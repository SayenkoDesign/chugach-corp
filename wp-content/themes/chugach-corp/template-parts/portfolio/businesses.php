<?php
// Portfolio - Operating Companies - Businesses

if( ! class_exists( 'Portfolio_Businesses_Section' ) ) {
    class Portfolio_Businesses_Section extends Element_Section {
                
        public function __construct() {
            parent::__construct();
                                    
            $fields = get_field( 'our_businesses' );
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
                     $this->get_name() . '-businesses'
                ]
            ); 
            
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-businesses'
                ]
            ); 
        } 
               
        
        // Add content
        public function render() {
            
                        
            $heading        = $this->get_fields( 'heading' );
            $heading        = _s_format_string( $heading, 'h2' );
            
            $description = $this->get_fields( 'description' );
                        
            $heading = sprintf( '<div class="row column"><header class="header">%s%s</header></div>', $heading, $description );
            
            $grid = $this->get_grid();
                        
            return $heading . $grid;
        }
        
        
        private function get_grid() {
             $rows =  $this->get_fields( 'grid' );  
             
             if( empty( $rows ) ) {
                 return false;
             }
             
             $columns = [];
             
             foreach( $rows as $row ) {
                 $columns[] = $this->get_column( $row );
             }
             
             if( ! empty( $columns ) ) {
                 return sprintf( '<div class="row small-up-1 medium-up-3 small-collapse grid">%s</div>', join( '', $columns ) );
             }
        }
        
        
        private function get_column( $row = [] ) {
            
            static $i;
            $i++;
            
            if( empty( $row['logo'] ) ) {
                return false;
            }
            
            $logo =  $row['logo'];  
            $logo = _s_get_acf_image( $logo );   
            
            $title =                              
            
            $out = sprintf( '<article id="post-%s" class="%s">', 
                             $i, 
                             join( ' ', get_post_class( 'column [ is-collapsed ]' ) )
                          );

            
            
            //$icon = _s_get_acf_image( $icon );                                
            //$icon = sprintf( '<div class="column column-block shrink"><span class="icon">%s</span></div>', $icon );  
            
            $heading    = _s_format_string( $row['heading'], 'h3' );
            $subheading = _s_format_string( $row['subheading'], 'h4' );  
            $heading = sprintf( '<header>%s%s</header>', $heading, $subheading ); 
            $description = _s_format_string( $row['description'], 'p' );   
            
            $link = '';
            if( ! empty( $row['link'] ) ) {
                
                $link = sprintf( '<p><a href="%s" class="button">%s</a></p>', esc_url( $row['link'] ), __( 'Website', '_s' ) );
            }
                                                             
            $photo = $row['photo'];
            $right = '';
            $column_class = '';
            if( ! empty( $photo ) ) {
                $right = sprintf( '<div class="column show-for-large text-right"><div class="photo">%s</div></div>', 
                                  _s_get_acf_image( $photo, 'medium' ) );
                $column_class = ' small-12 large-6';
            }
            
            $left = sprintf( '<div class="column%s"><div class="entry-content">%s%s%s</div></div>',
                             $column_class,
                             $heading,
                             $description,
                             $link 
             );
             
             
                               
            $expander = sprintf( '<div class="row large-unstack">%s%s%s</div>',
                                    $left,
                                    $right,
                                    '<i class="close [ js-collapser ]"><span class="screen-reader-text">close</span></i>'
                               );
            
            $out .= sprintf( '<div class="column__inner [ js-expander ]">
                                <div class="panel">
                                    <a class="thumbnail open">%s</a>
                                </div>
                              </div>
                              <div class="hide column__expander">%s</div>', 
                    $logo, 
                    $expander
                    
                  );
            
            $out .= '</article>';   
            
            return $out;
        }
        
    }
}
   
new Portfolio_Businesses_Section;
