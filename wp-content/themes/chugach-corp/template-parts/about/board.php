<?php
// About - Board

if( ! class_exists( 'About_Board_Section' ) ) {
    class About_Board_Section extends Element_Section {
        
        var $post_type = 'people';
        
        public function __construct() {
            parent::__construct();
            
            $fields = get_field( 'board_of_directors' );
            $this->set_fields( $fields );
                        
            $settings = get_field( 'settings' );
            $this->set_settings( $settings );
                        
            // Render the section
            if( empty( $this->render() ) ) {
                //return;   
            }
            
            // print the section
            $this->print_element();        
        }
              
        // Add default attributes to section        
        protected function _add_render_attributes() {
            
            // use parent attributes
            parent::_add_render_attributes();
    
            $this->add_render_attribute(
                'wrapper', 'class', [
                     $this->get_name() . '-board'
                ]
            );   
            
            $this->add_render_attribute(
                'wrapper', 'id', $this->get_name() . '-board', true );          
            
        }          
        
        // Add content
        public function render() {
            
            $fields = $this->get_fields();
            
            // Header
            $header = new Element_Header( [ 'fields' => $fields ] ); // set fields from Constructor
            if( ! empty( $header->get_element() ) ) {
                $row = new Element_Row(); 
                $column = new Element_Column(); 
                $column->add_child( $header );
                $row->add_child( $column );
                $this->add_child( $row ); 
            }
            
            $people = $this->people();
            if( ! empty( $people ) ) {
                $html = new Element_Html( [ 'fields' => [ 'html' => $people ] ] );
                $this->add_child( $html ); 
            } 
                        
        }
        
        
        private function people() {
            
            $post_ids = $this->get_fields( 'people' );
        
            $args = array(
                'post_type' => $this->post_type,
                'orderby' => 'menu_order title',
                'order' => 'ASC',
                'posts_per_page' => 100,
            );
                        
            if( ! empty( $post_ids ) ) {
                $args['orderby'] = 'post__in';
                $args['post__in'] = $post_ids;
                $args['posts_per_page'] = count( $post_ids );
            }
            
            $loop = new WP_Query( $args );
            
            $out = '';
            
            if ( $loop->have_posts() ) :                 
                
                $out .= '<div class="row small-up-1 medium-up-2 large-up-3 xxlarge-up-4 grid" data-equalizer data-equalize-on="medium">';
          
                while ( $loop->have_posts() ) :
    
                    $loop->the_post(); 
                    
                    $out .= sprintf( '<article id="post-%s" class="%s">', 
                                     get_the_ID(), 
                                     join( ' ', get_post_class( 'column' ) )
                                  );
    
                    $background = sprintf( ' style="background-image: url(%s)"', get_the_post_thumbnail_url( get_the_ID(), 'thumbnail' ) );
                    
                    $position  = get_field( 'position' );
                    $position = _s_format_string( $position, 'p', [ 'class' => 'position' ] );
                    
                    $linkedin = get_field( 'linkedin' );
                    if( ! empty( $linkedin ) ) {
                        $linkedin = sprintf( '<div class="icon"><a href="%s" class="linkedin">%s</a></div>', $linkedin, get_svg( 'linkedin' ) );
                    }
                    
                    $title  = sprintf( '<div class="header">%s%s%s</div>', the_title( '<h5>', '</h5>', false ), $position, $linkedin );
                                                           
                   
                    
                    $out .= sprintf( '<div class="panel">
                                            <div class="thumbnail"%s></div>
                                            <div class="details" data-equalizer-watch>%s</div>
                                      </div>', 
                            $background, 
                            $title
                          );
                    
                    $out .= '</article>';
    
                endwhile;
                
                $out .= '</div>';
                
            endif; 
            
            wp_reset_postdata();
            
            return $out;
        }
    }
}
   
new About_Board_Section;