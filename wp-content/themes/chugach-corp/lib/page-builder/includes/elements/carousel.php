<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


class Element_Carousel extends Element_Base {

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
		return 'carousel';
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
        
        $rows = $this->get_fields( 'rows' );
        
        $this->add_render_attribute( 'element', 'class', 'carousel' );
                                    
        return sprintf( '<div %s>%s</div>', $this->get_render_attribute_string( 'element' ), $grid );
	}
    	
}
