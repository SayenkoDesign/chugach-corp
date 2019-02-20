<?php
// Home - Clients

if( ! class_exists( 'Home_Clients_Section' ) ) {
    class Home_Clients_Section extends Element_Section {
        
        var $post_type = 'client';
        
        public function __construct() {
            parent::__construct();
            
            $fields = get_field( 'clients' );
            $this->set_fields( $fields );
                        
            $settings = get_field( 'settings' );
            $this->set_settings( $settings );
                        
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
                     $this->get_name() . '-clients'
                ]
            );   
            
            $this->add_render_attribute(
                'wrapper', 'id', $this->get_name() . '-clients', true );          
            
        }  
                
        
        // Add content
        public function render() {
            
            $fields = $this->get_fields();
                                                                        
            $row = new Element_Row(); 
            $column = new Element_Column(); 
            
            // Header
            $header = new Element_Header( [ 'fields' => $fields ] );
            $column->add_child( $header );
            
            // Grid
            $html = new Element_Html( [ 'fields' => [ 'html' => $this->clients() ] ] );
            $html->add_render_attribute( 'wrapper', 'class', 'logos' );
            $column->add_child( $html );
            
            $row->add_child( $column );
            $this->add_child( $row ); 
                        
        }
        
        
        private function clients() {
        
            $post_ids = $this->get_fields( 'clients' );
            
            
            $out = '';
            $columns = '';
            
            $args = array(
                'post_type'      => $this->post_type,
                'post_status'    => 'publish',
                'posts_per_page' => 20,
            );
            
            if( ! empty( $post_ids ) ) {
                $args['orderby'] = 'post__in';
                $args['post__in'] = $post_ids;
                $args['posts_per_page'] = 100;
            }
        
            // Use $loop, a custom variable we made up, so it doesn't overwrite anything
            $loop = new WP_Query( $args );
                    
            // have_posts() is a wrapper function for $wp_query->have_posts(). Since we
            // don't want to use $wp_query, use our custom variable instead.
            if ( $loop->have_posts() ) : 
                
                while ( $loop->have_posts() ) : $loop->the_post(); 
                    $url = get_field( 'url' );
                    $image = get_the_post_thumbnail( get_the_ID(), 'medium' );
                    $tag = 'span';
                    if( !empty( $url ) ) {
                        $tag = 'a';
                        $this->add_render_attribute( 'anchor', 'href', $url, true );
                    }
                    $columns .= sprintf( '<div class="logo"><%1$s %2$s>%3$s</%1$s></div>', 
                                        $tag, 
                                        $this->get_render_attribute_string( 'anchor' ), 
                                        $image ); 
                endwhile;
                
                $out = sprintf( '<div class="slick slick-default">%s</div><div class="slick-arrows"></div>', $columns );
                
            endif;
        
            wp_reset_postdata();
  
            return $out;
        }
        
        
    }
}
   
new Home_Clients_Section;