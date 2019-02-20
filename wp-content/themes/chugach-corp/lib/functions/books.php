<?php

class Single_Project {
    
    public $project_id;
    protected $post_type = 'project';
    
    public function __construct( $project_id = null ) {
		if ( ! $this->project_id = $this->get_project_id( $project_id ) ) {
			return false;
		}
	}
    
    
    private function get_project_id( $project ) {
		if ( false === $project && isset( $GLOBALS['post'], $GLOBALS['post']->ID ) && $this->post_type === get_post_type( $GLOBALS['post']->ID ) ) {
			return $GLOBALS['post']->ID;
		} elseif ( is_numeric( $project ) ) {
			return $project;
		} elseif ( $project instanceof WP_Post ) {
			return get_the_ID();
		} elseif ( ! empty( $project->ID ) ) {
			return $project->ID;
		} else {
			return false;
		}
	}
    
    public function get_services() {
        
        $services = $this->_get_services(); 
        
        if( empty( $services ) ) {
            return false;
        }
        
        $out = '';
               
        foreach( $services as $service ) {
            $out .= sprintf( '<li><a href="%s">%s</a></li>', get_permalink( $service->ID ), $service->post_title );
        }
        
        return sprintf( '<div class="panel"><h3>Services</h3><ul class="no-bullet">%s</ul></div>', $out );
    }
    
    
    public function get_service_icon() {
        
        $services = $this->_get_services();
                    
        if( ! empty( $services ) ) {
            $service = array_shift( $services );
            if( ! empty( $service->icon ) ) {
                return $service->icon;
            }
        }
        
        return false;
    }
    
    
    private function _get_services() {
        
        $services = get_field( 'services', $this->project_id ); 
        
        if( empty( $services ) ) {
            return false;
        }
                
        foreach( $services as $service ) {
            $attachment_id = get_field( 'icon', $service->ID );
            if( ! empty( $attachment_id ) ) {
                $service->icon = sprintf( '<span class="icon">%s</span>', wp_get_attachment_image( $attachment_id, 'medium' ) );
            }
        }
        
        return $services;
    }
    
    
    public function get_industry() {
        return $this->get_terms( 'Industry', 'industry' );
    }
    
    
    public function get_location() {
        return $this->get_terms( 'Location', 'region' );
    }
    
    
    public function get_industry_icon() {
        
        $terms = wp_get_post_terms( $this->project_id, 'industry' );
                
        if( is_wp_error( $terms ) || empty( $terms ) ) {
            return false;
        } 
        
        $attachment_id = get_field( 'image', $terms[0] );
        
        return _s_get_acf_image($attachment_id, 'thumbnail' );
    }
    
    
    protected function get_terms( $title = false, $taxonomy = false ) {
        
        if( empty( $title ) || empty( $taxonomy ) ) {
            return false;
        }
        
        $terms = wp_get_post_terms( $this->project_id, $taxonomy );
                        
        if( is_wp_error( $terms ) || empty( $terms ) ) {
            return false;
        } 
        
        $out = '';
        
        foreach( $terms as $term ) {
            $out .= sprintf( '<li>%s</li>', $term->name );             
        }
        
        return sprintf( '<div class="panel"><h3>%s</h3><ul class="no-bullet">%s</ul></div>', $title, $out );
    }
    
}