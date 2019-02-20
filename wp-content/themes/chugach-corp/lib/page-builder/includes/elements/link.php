<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


class Element_Link extends Element_Base {

	static public $count;
    
    /**
	 * Get widget name.
	 *
	 * Retrieve button widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'link';
	}
    
	
	/**
	 * Render button widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	public function render() {
                                
		if( empty( $this->get_fields( 'link' ) ) ) {
            return;
        }
                
        $link = $this->get_fields( 'link' );
                              
        if( ! is_array( $link ) ) {
            $link['url'] = $link;
        }
                
        if( ! $this->get_render_attribute_string( 'anchor' ) ) {
            $this->add_render_attribute( 'anchor', 'href', $link['url'] );
        }
        
        if( $this->get_settings( 'title' ) ) {
            $link['title'] = $this->get_settings( 'title' );
        }
        
        if( empty( $link['title'] ) || empty( $link['url'] ) ) {
            return false;
        }
                                                                          
        $this->add_render_attribute( 'wrapper', 'class', 'element-link' );
        
        // RAW output
        if( true === $this->get_settings( 'raw' ) ) {
            return sprintf( '<a %s><span>%s</span></a>', 
                             $this->get_render_attribute_string( 'anchor' ), 
                             $link['title']
                          );
        }
                                    
        return sprintf( '<div %s><p><a %s><span>%s</span></a></p></div>', 
                         $this->get_render_attribute_string( 'wrapper' ), 
                         $this->get_render_attribute_string( 'anchor' ), 
                         $link['title']
                      );
	}
    	
}
