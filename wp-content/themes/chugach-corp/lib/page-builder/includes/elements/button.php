<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


class Element_Button extends Element_Base {

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
		return 'button';
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
        
        /*
        type = link/modal
        link = [itle, url,target]
        */
                                                
        $button = $this->get_fields( 'button' );
        
        if( empty( $button ) ) {
            return;
        }
                
        $url = '';
        $title = '';
        $target = '';
        
        $type = 'link';
        if( ! empty( $button['type'] ) ) {
            $type = strtolower( $button['type'] );
        }
        
        if( 'modal' == $type ) {
            $title = $button['modal_button_text'];
        } else {
            if( ! empty( $button['link'] ) ) {
                $button = $button['link'];
            } 
            
            $button = array_filter( $button );
            
            if( ! empty( $button['url'] ) ) {
                $url    = $button['url'];
            }
            
            if( ! empty( $button['title'] ) ) {
                $title    = $button['title'];
            }
            
            if( ! empty( $button['target'] ) ) {
                $target    = $button['target'];
            }
            
        }
                
        // Are there any settings?
        if( $this->get_settings( 'type' ) ) {
            $url = $this->get_settings( 'type' );
        }
        
        if( $this->get_settings( 'url' ) ) {
            $url = $this->get_settings( 'url' );
        }
        
        if( $this->get_settings( 'title' ) ) {
            $title = $this->get_settings( 'title' );
        }
        
        if( $this->get_settings( 'target' ) ) {
            $target = $this->get_settings( 'target' );
        }
        
        // Do we have a button?
        if( ! empty( $url ) ) {
            $this->add_render_attribute( 'anchor', 'href', $url );
        }
                                                             
        if( ! empty( $target ) ) {
            $this->add_render_attribute( 'anchor', 'target', $target );
        }
                                                                                                          
        if( ! $this->get_render_attribute_string( 'wrapper' ) ) {
            $this->add_render_attribute( 'wrapper', 'class', 'element-button' );
        }
        
        if( empty( $title ) ) {
            return;
        }
        
        // RAW output
        if( true === $this->get_settings( 'raw' ) ) {
            return sprintf( '<a %s><span>%s</span></a>', 
                             $this->get_render_attribute_string( 'anchor' ), 
                             $title
                          );
        }
                                    
        return sprintf( '<div %s><p><a %s><span>%s</span></a></p></div>', 
                        $this->get_render_attribute_string( 'wrapper' ), 
                        $this->get_render_attribute_string( 'anchor' ), 
                        $title );
	}
    	
}
