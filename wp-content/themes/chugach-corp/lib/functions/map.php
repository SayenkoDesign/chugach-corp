<?php

/*
Settings page:

- set active marker?
- set zoom? 
*/

namespace PSC;

class Map {
    
    protected $post_type = 'map';
    
    
    public function __construct() {
	    
	}
    
        
    public function get_markers() {
        
        $loop = new \WP_Query( array(
            'post_type' => $this->post_type,
            'order' => 'ASC',
            'posts_per_page' => 100,
        ) );
                
        $markers = [];
                
        if ( $loop->have_posts() ) : 
                                          
            while ( $loop->have_posts() ) :
                            
                $loop->the_post(); 
                
                $sm = new Single_Marker;
                                                
                $markers[] = $sm->get_fields();

            endwhile;
                        
        endif; 
        
        wp_reset_postdata();
        
        return $markers;
    }
    
    
    public function get_legend() {
        
        $terms = $this->get_terms();
        
        $list = [];
                
        foreach( $terms as $term ) {
            
            $key = sprintf( '<span class="location">%s</span>', $term->name );
            
            $criteria = array('location' => $term->slug );
            $markers = wp_list_filter( $this->get_markers(), $criteria );
                        
            $children  = [];
            if( ! empty( $markers ) ) {
                foreach( $markers as $marker ) {
                    $children[] = sprintf( '<span class="marker-anchor" data-marker-id="%s">%s</span>', $marker['id'], $marker['title'] );
                }
            }
            
            $list[$key] = $children;
        }
        
        return $list;
    }
    
    
    public function get_locations() {
                
        // Use class "Map" functions/map.php
        $map = new Map;
        $map_markers = $map->get_markers();
        
        $terms=  $map->get_terms();
        
        $list = [];
                
        foreach( $terms as $term ) {
            
            $key = $term->name;
            
            $criteria = array('location' => $term->slug );
            $markers = wp_list_filter( $map_markers, $criteria );
                        
            $children  = [];
            if( ! empty( $markers ) ) {
                foreach( $markers as $marker ) {
                    
                    $sm = new Single_Marker( $marker['id'] );
                    $children[] = sprintf( '<div class="marker-address">%s</div>', $sm->marker_address() );                      
                }
            }
            
            $list[$key] = $children;
        }
        
        return $list;
    }   
    
}



function psc_map_get_markers() {
    $map = new \PSC\Map;  
    return $map->get_markers();
}

function psc_map_get_legend() {
    $map = new \PSC\Map;  
    return $map->get_legend();
}

function psc_map_get_locations() {
    $map = new \PSC\Map;   
    return $map->get_locations(); 
}







class Single_Marker {
    
    protected $post_type = 'map';
    
    private $data = [];
    
    protected $fields = [ 'address', 'phone', 'fax', 'email', 'active' ];
    
    
    public function __construct( $marker_id = false ) {
        if ( ! $marker_id = $this->get_marker_id( $marker_id ) ) {
			return false;
		}
	    $this->process_fields( $marker_id );
        $this->get_marker( $marker_id );
	}
    

	private function get_marker_id( $marker ) {
		if ( false === $marker && isset( $GLOBALS['post'], $GLOBALS['post']->ID ) && $this->post_type === get_post_type( $GLOBALS['post']->ID ) ) {
			return $GLOBALS['post']->ID;
		} elseif ( is_numeric( $marker ) ) {
			return $marker;
		} elseif ( $marker instanceof WP_Post ) {
			return get_the_ID();
		} elseif ( ! empty( $marker->ID ) ) {
			return $marker->ID;
		} else {
			return false;
		}
	}
    
    
    public function get_fields() {
        return $this->data;   
    }
    
    
    private function process_fields( $marker_id ) {
        
        $this->data['id'] = $marker_id;
        $this->data['title'] = get_the_title( $marker_id );
        $this->data['location'] = $this->get_location( $marker_id );
        
        foreach( $this->fields as $key ) {
            
            $field = get_field( $key, $marker_id );
            
            if( 'phone' == $key ) {
                $return = _s_format_string( $field, 'a', [ 'href' => _s_format_telephone_url( $field ) ] );
            } else if( 'email' == $key ) {
                $email = antispambot( $field );
                $email_link = sprintf( 'malto:%s', $email );
                $return = _s_format_string( $email, 'a', [ 'href' => $email_link ] );
            } else if( 'fax' == $key ) {
                $return = $field;
            }
            else {
                $return = $field;
            }
            
            $this->data[$key] = $return;
        }
        
    }
    
    private function get_marker( $marker_id ) {
        
        $marker = get_field( 'marker', $marker_id );
        
        if( ! empty( $marker ) ) {
            $this->data['marker'] = sprintf( '<div id="marker-%s" class="marker" data-id="%d" data-location="%s" data-lat="%s" data-lng="%s" data-active="%s">%s</div>', 
                         $this->get_data( 'id' ), 
                         $this->get_data( 'id' ), 
                         $this->get_data( 'location' ),  
                         $marker['lat'], 
                         $marker['lng'], 
                         $this->get_data( 'active' ),
                         $this->marker_address()
                         
           );
        }
        
    }
    
    
    public function marker_address() {
        return sprintf( '%s%s%s%s%s', 
               
                        sprintf( '<h5>%s</h5>', $this->get_data( 'title' ) ), 
                        $this->get_data( 'address', true ),  
                        $this->get_data( 'phone', true, 'Phone' ),  
                        $this->get_data( 'fax', true, 'Fax' ),  
                        $this->get_data( 'email', true )
               
               );
    }
    
    
    public function get_data( $key = false, $format = false, $label = '' ) {
        
        if( empty( $key ) ) {
            return false;
        }
                
        if( $format ) {
            return $this->format_value( $key, $label );
        }
        
        return $this->data[$key];
    }

    
    private function format_value( $key, $label = '' ) {
        
        if( ! empty( $label ) ) {
            $label = $label . ' ';
        }
                
        return sprintf( '<span class="%s">%s%s</span>', $key, $label, $this->data[$key] );   
    }
    
    
    private function get_location( $marker_id ) {
        $terms = wp_get_post_terms( $marker_id, 'location' );
        if( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
            $term = array_shift( $terms );
            return $term->slug;
        } 

        return false;  
    }
    
}