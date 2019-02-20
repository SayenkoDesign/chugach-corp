<?php
// Global - Events

if( ! class_exists( 'Global_Events_Section' ) ) {
    class Global_Events_Section extends Element_Section {
        
        public function __construct() {
            parent::__construct();
                                    
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
                     $this->get_name() . '-events',
                     $this->get_name() . '-events' . '-' . $this->get_id(),
                ]
            );            
            
        }  
       
        
        // Add content
        public function render() {
                                                                        
            $row = new Element_Row(); 
            
            $column = new Element_Column(); 
            
            $event_category = get_field( 'event_category' );
            
            $events = $this->get_events( $event_category );
            
            $heading = new Element_Html( [ 'fields' => array( 'html' => $events ) ]  ); // set fields from Constructor
            $column->add_child( $heading );
                        
            $row->add_child( $column );
            
            $this->add_child( $row );
        }
        
        
        private function get_events( $event_category = false ) {
                
            if( empty( $event_category ) ) {
                return false;
            }
                        
            if( is_wp_error( $event_category ) || ! $event_category instanceof WP_Term ) {
                return;
            }
                                                        
            $posts = [];
            
            $events = tribe_get_events( array(
               'eventDisplay' => 'list',
               'posts_per_page' => 10,
               //'tribe_events_cat' => implode( ', ', $event_categories )
               'tax_query' => array(
                        array(
                            'taxonomy' => 'tribe_events_cat',
                            'field' => 'slug',
                            'terms' => $event_category->slug
                        )
                    )
               ) 
            );
                        
            // The result set may be empty
            if ( empty( $events ) ) {
               //return false;
            }
            
            foreach( $events as $event ) {
                $posts[] = $this->get_single_event( $event );                            
            } 
            
            wp_reset_postdata();
            
            $posts = sprintf( '<div class="row small-up-1 large-up-2">%s</div>', implode( '', $posts ) );
            
            return sprintf( '<div class="events"><h3>Upcoming Events</h3>%s</div>', $posts );
            
        }
        
        
        private function get_single_event( $event ) {
                
            setup_postdata( $event );
            
            $link = esc_url( tribe_get_event_link( $event ) );
            
            $full_date = sprintf( '<span class="event-date">%s</span>', tribe_get_start_date( $event, false, 'F j, Y g:iA' ) );
            
            $venue = sprintf( '<span class="event-venue">%s</span>', strip_tags( tribe_get_venue( $event ) ) );
            
            // time
            $time = sprintf( '<span class="event-time">%s</span>', tribe_get_start_time( $event, 'g:iA' ) );
            
            // Price - custom field
            $price = get_field( 'event_price', $event );
            if( !empty( $price ) ) {
                $price = sprintf( '<span class="event-price">%s</span>', $price );
            }
            
            $time_price = sprintf( '<span class="event-time-price">%s%s</span>', $time, $price );
            
            $event_meta = sprintf( '<p>%s%s</p>', $full_date, $venue );
            
            $custom_link_text = get_field( 'custom_link_text', $event );
            
            $permalink = sprintf( '<a href="%s" class="more">%s</a>', $link, $custom_link_text ? $custom_link_text : 'more info' );
           
            return sprintf( '<div class="column column-block event"><div class="event-details"><header><a href="%s"><h4>%s</h4></a></header>%s%s</div></div>', 
                            $link,
                            get_the_title( $event ),
                            $event_meta,
                            $permalink                
            
            );
        }
        
    }
}
   
new Global_Events_Section;
