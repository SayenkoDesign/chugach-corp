<?php
// Leadership - People

if( ! class_exists( 'Leadership_People_Section' ) ) {
    class Leadership_People_Section extends Element_Section {
        
        var $post_type = 'people';
        
        public function __construct() {
            parent::__construct();
            
            $fields = get_field( 'leadership' );
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
                     $this->get_name() . '-leadership'
                ]
            );   

            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-leadership'
                ], true
            );            
            
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
                $html->add_render_attribute( 'wrapper', 'class', 'column row' ); 
                $this->add_child( $html ); 
            } 
                        
        }
        
        
        private function people() {
                        
            $post_ids = $this->get_fields( 'people' );
            
            if( empty( $post_ids ) ) {
                return false;
            }
        
            $args = array(
                'post_type' => $this->post_type,
                'order' => 'ASC',
                'orderby' => 'post__in',
                'post__in' => $post_ids,
                'posts_per_page' => count( $post_ids ),
            );
            
            $loop = new WP_Query( $args );
            
            $out = '';
            
            if ( $loop->have_posts() ) :                 
                          
                while ( $loop->have_posts() ) :
    
                    $loop->the_post(); 
                    
                    $out .= $this->get_column();
    
                endwhile;
                
            endif; 
            
            wp_reset_postdata();
                        
            return sprintf( '<div class="row small-up-1 medium-up-2 large-up-3 xlarge-up-4 grid" data-equalizer data-equalize-on="medium">%s</div>', 
                                    $out );
        }
        
        
        private function get_column() {
            
            $out = sprintf( '<article id="post-%s" class="%s">', 
                             get_the_ID(), 
                             join( ' ', get_post_class( 'column [ is-collapsed ]' ) )
                          );

            $background = sprintf( ' style="background-image: url(%s)"', get_the_post_thumbnail_url( get_the_ID(), 'thumbnail' ) );
            
            $position  = get_field( 'position' );
            $position = _s_format_string( $position, 'p', [ 'class' => 'position' ] );
            
            $linkedin = get_field( 'linkedin' );
            if( ! empty( $linkedin ) ) {
                $linkedin = sprintf( '<a href="%s" class="linkedin">%s</a>', $linkedin, get_svg( 'linkedin' ) );
            }
            
            $more = '<span class="more">more...</span>';
            
            $title  = sprintf( '<a class="header open">%s%s%s%s</a>', 
                                the_title( '<h4>', '</h4>', false ), 
                                $position, 
                                $more, 
                                $linkedin );   
                                                 
            $photo = get_field( 'photo' );
            $right = '';
            $column_class = '';
            if( ! empty( $photo ) ) {
                $right = sprintf( '<div class="column show-for-large text-right"><div class="photo">%s</div></div>', _s_get_acf_image( $photo, 'leadership' ) );
                $column_class = ' small-12 large-6';
            }
            
            $left = sprintf( '<div class="column%s"><div class="entry-content">%s%s%s</div></div>',
                             $column_class,
                             the_title( '<h3>', '</h3>', false ),
                             $position,
                             $this->accordion()
             );
             
             
                               
            $expander = sprintf( '<div class="row large-unstack">%s%s%s</div>',
                                    $left,
                                    $right,
                                    '<i class="close [ js-collapser ]"><span class="screen-reader-text">close</span></i>'
                               );
            
            $out .= sprintf( '<div class="column__inner [ js-expander ]">
                                <div class="panel">
                                    <div class="thumbnail"%s></div>
                                    <div class="details" data-equalizer-watch>%s</div>
                                </div>
                              </div>
                              <div class="column__expander">%s</div>', 
                    $background, 
                    $title, 
                    $expander
                    
                  );
            
            $out .= '</article>';   
            
            return $out;
        }
        
        
        private function accordion() {
            
            $fields = [ 'articles', 'bio' ];
            
            $fa = new Foundation_Accordion( array('data' => array( 'data-accordion' => 'true',  'data-multi-expand' => 'false', 'data-allow-all-closed' => 'true' ) ) );
            
            $i = 0;
                
            foreach( $fields as $key => $field ) {
                $heading = call_user_func_array( array( $this, $field ), array( 'heading' ) );
                $content = call_user_func_array( array( $this, $field ), array( 'content' ) );
                if( ! empty( $heading ) && ! empty( $content ) ) {
                    $active = ( ! $i ? true : false );
                    $fa->add_item( $heading, $content, $active );
                    $i++;
                }
                
            }
            
            return $fa->get_accordion();
        }  
              
        
        private function articles( $return  = 'content' ) {
            $heading = $this->get_heading( 'articles' );
            $group = get_field( 'articles' );
            $list = [];
            $content = '';
            if( ! empty( $group['articles'] ) ) {
                $rows = $group['articles'];
                if( ! empty( $rows ) ) {
                    foreach( $rows as $row ) {
                        $list[] = sprintf( '<a href="%s">%s</a>', get_permalink( $row ), get_the_title( $row ) );
                    }
                }
                
                $content = ul( $list, ['class' => 'links' ] );
            }
            
            return ( 'heading' == $return ) ? $heading : $content;
        }
        
        
        private function bio( $return  = 'content' ) {
            $heading = $this->get_heading( 'bio' );
            $group = get_field( 'bio' );
            $content = $group['editor'];
            return ( 'heading' == $return ) ? $heading : $content;
        }
        
        
        private function get_heading( $field ) {
            $group = get_field( $field );
            if( ! empty( $group['heading'] ) ) {
                return $group['heading'];
            }
            return false;
        }
    }
}
   
/*new Leadership_People_Section; */

$fields = get_field( 'teams' );

if( ! empty( $fields ) ) {
    foreach( $fields as $key => $field ) {
        $section = new Leadership_People_Section();
        $section->set_fields( $field );
        $section->add_render_attribute( 'wrapper', 'class', $section->get_name() . '-leadership' ); 
        $section->render();
        $section->print_element();  

    }
}
