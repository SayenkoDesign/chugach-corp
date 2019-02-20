<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


class Element_Faq extends Element_Base {

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
		return 'faq';
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
                                
		$fields = $this->get_fields();
                                                                
        if ( empty( $fields ) ) {
            return;
        }
        
        $rows = $this->get_fields( 'faq' );
        
        if( empty( $rows ) ) {
            return false;
        }
        
        $fa = new Foundation_Accordion;
                
        foreach( $rows as $key => $row ) {
            $fa->add_item( $row['question'], $row['answer'] );
        }
        
        $accordion = $fa->get_accordion();
        
        $this->add_render_attribute( 'wrapper', 'class', 'element-faq' );
                                        
        return sprintf( '<div %s>%s</div>', $this->get_render_attribute_string( 'wrapper' ), $accordion );
	}
    
    public function __construct( array $data = [], array $args = null ) {
        parent::__construct( $data );
	}
    	
}
