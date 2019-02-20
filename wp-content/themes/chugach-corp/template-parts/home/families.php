<?php
// Home - Families

if( ! class_exists( 'Home_Families_Section' ) ) {
    class Home_Families_Section extends Element_Section {
        
        var $post_type = 'family';
        
        public function __construct() {
            parent::__construct();
                        
            if( empty( $this->families() ) ) {
                return;                
            }
                        
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
                     $this->get_name() . '-families'
                ]
            );   
            
            $this->add_render_attribute(
                'wrapper', 'id', $this->get_name() . '-families', true );            
            
        }          
        
        // Add content
        public function render() {
            
            $fields = $this->get_fields();
            
            $icon = sprintf( '<div class="column shrink icon"><span><img src="%shome/whishlist-icon.svg" /></span></div>', trailingslashit( THEME_IMG ) );                                                        
            $header = sprintf( '<header class="row align-center"><div class="column shrink"><div class="row">%s<div class="column shrink"><h2>Next Families</h2><h4>On the "Wish List"</h4></div></div></header>', $icon );
            
            $html = new Element_Html( [ 'fields' => [ 'html' => $header . $this->families() ] ] );
            $html->add_render_attribute( 'wrapper', 'class', 'families' );
            return $html->get_element();
                        
        }
        
        
        private function families() {
        
            $today = current_time( 'Ymd' ); // local time set under Settings > General
                                
            $meta_query = array(
    
                array(
                    'key'			=> 'amount_owing',
                    'compare'		=> '>',
                    'value'			=> (int) 0, // needed
                    'type'          => 'numeric' // needed
                ),
                array(
                    'key'		=> 'start_date',
                    'compare'	=> '<=',
                    'value'		=> $today,
                )
    
            );
                    
            $loop = new WP_Query( array(
                'post_type' => $this->post_type,
                'order' => 'ASC',
                'meta_key' => 'start_date',
                'orderby'  => 'meta_value_num',
                'posts_per_page' => '4',
                'meta_query' => $meta_query,
            ) );
                        
            $columns = '';
            $out = '';
            
            if ( $loop->have_posts() ) : 
                                                              
                while ( $loop->have_posts() ) :
    
                    $loop->the_post(); 
                        
                    $columns .= sprintf( '<div class="column column-block">%s</div>', _s_get_template_part( 'template-parts/family', 'archive-column', [], true ) );
    
                endwhile;
                
                $out = sprintf( '<div class="row small-up-1 medium-up-2 large-up-3 xlarge-up-4 align-center grid" data-equalizer="panel" data-equalize-on="medium" data-equalize-by-row="true">%s</div>', $columns );
                
                $out .= sprintf( '<div class="column row text-center"><p><a href="%s" class="button reverse"><span>See All Families</span></a></p></div>', get_post_type_archive_link( 'family' ) );
                
            endif; 
            
            wp_reset_postdata();
            
            return $out;
        }
                
    }
}
   
new Home_Families_Section;