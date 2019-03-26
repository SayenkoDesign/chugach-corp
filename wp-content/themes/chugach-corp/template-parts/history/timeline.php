<?php
// History - Timeline

if( ! class_exists( 'History_Timeline_Section' ) ) {
    class History_Timeline_Section extends Element_Section {
        
        var $post_type = 'history';
        
        public function __construct() {
            parent::__construct();
                        
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
                     $this->get_name() . '-timeline'
                ]
            );   

            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-timeline'
                ], true
            );            
            
        }          
        
        // Add content
        public function render() {

            $args = array(
                'post_type' => $this->post_type,
                'order' => 'ASC',
                'orderby' => 'meta_value_num',
                'meta_key' => 'year_start',
                'posts_per_page' => -1,
            );
            
            $loop = new WP_Query( $args );
            
            $out = '';
            
            if ( $loop->have_posts() ) :                 
                          
                while ( $loop->have_posts() ) :
    
                    $loop->the_post(); 
                    
                    $defaults = [
                        'decade' => 0,
                        'event_start' => 0,
                        'event_end'   => 0,
                        'event_date' => 0
                    ];
                    
                    $index = $loop->current_post;
                    $alignment = $index % 2 ? 'event-odd' : 'event-even';
                                        
                    if( ! $index ) {
                        $last_year = 0;
                    }
                    
                    $event_start = get_field( 'year_start' );
                    $event_end   = get_field( 'year_end' );
                    
                    $event_date = $event_end ? sprintf( '%s-%s', $event_start, substr($event_end, -2 ) ) : $event_start;
                    
                    $data = [
                        'event_start' => $event_start,
                        'event_end'   => $event_end,
                        'event_date'  => $event_date,
                        'alignment'   => $alignment
                    ];
                    
                    
                    $last_year_decade = $last_year - ($last_year % 10);
                    $event_start_decade = $event_start - ($event_start % 10);
                    
                    
                    if( $index ) {
                        $data_attributes = get_data_attributes( ['data-aos' => 'zoom-in', 'data-aos-anchor-placement' => 'top-center'] );
                    } else {
                        $data_attributes = get_data_attributes( ['data-aos' => 'zoom-in'] );
                    }
                    
                    
                    if( $event_start_decade > $last_year_decade ) {
                        $data['decade'] = $event_start_decade;
                        $out .= sprintf( '<div class="decade" %s>%s</div>', 
                                         $data_attributes,
                                         $event_start_decade
                                       );
                    }
                    
                    
                    
                    $data = wp_parse_args( $data, $defaults );
                    
                    $out .= _s_get_template_part( 'template-parts/history', 'event', $data, true );
                    
                    $last_year = $event_start;
    
                endwhile;
                
            endif; 
            
            wp_reset_postdata();
                        
            return sprintf( '<div class="column row">%s</div>', $out );
                        
        }
    }
}
   
new History_Timeline_Section;