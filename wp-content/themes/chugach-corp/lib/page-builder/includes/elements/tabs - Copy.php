<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


class Element_Tabs extends Element_Base {

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
		return 'tabs';
	}
    
    
    // Add default attributes to section        
    protected function _add_render_attributes() {
        
        // use parent attributes
        parent::_add_render_attributes();
        
        /*
        $background_image       = $this->get_fields( 'background_image' );
        $background_position_x  = strtolower( $this->get_fields( 'background_position_x'  ) );
        $background_position_y  = strtolower( $this->get_fields( 'background_position_y' ) );
        $background_overlay     = $this->get_fields( 'background_overlay' );
        
        if( ! empty( $background_image ) ) {
            $background_image = _s_get_acf_image( $background_image, 'hero', true );
                            
            $this->add_render_attribute( 'element', 'style', sprintf( 'background-image: url(%s);', $background_image ) );
            $this->add_render_attribute( 'element', 'style', sprintf( 'background-position: %s %s;', 
                                                                      $background_position_x, $background_position_y ) );
            
            if( true == $background_overlay ) {
                 $this->add_render_attribute( 'element', 'class', 'background-overlay' ); 
            }
                                                                      
        }  
        */         
        
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
        
        $rows = $this->get_fields( 'tabs' );
            
        if( empty( $rows ) ) {
            return;
        }
                    
        $navigation = '';
        $panels = '';
                            
        foreach( $rows as $key => $row ) { 
                                            
            $tab_name    = $row['tab_name'];    
            $heading     = _s_format_string( $row['heading'], 'h3' );  
            $description = $row['description']; 
            
            $active = ! $key ? ' active' : '';
            
            $navigation .= sprintf( '<li class="%s"><h5>%s</h5></li>', $active, $tab_name ); 
            
            $tab_name    = _s_format_string( $row['tab_name'], 'h4', [ 'class' => 'hide-for-large' ] );  
            
            $panels .= sprintf( '<div class="panel">%s%s%s</div>', 
                             $tab_name, 
                             $heading, 
                             $description 
                             );
        }
        
        
        $navigation = sprintf( '<div class="column row show-for-large"><ul class="no-bullet navigation">%s</ul></div>', $navigation );
        $panels = sprintf( '<div class="column row"><ul class="panels">%s</ul></div>', $panels );
        
                
        $this->add_render_attribute( 'element', 'class', 'tabs' );
                                    
        return sprintf( '<div %s>%s%s</div>', $this->get_render_attribute_string( 'element' ), $navigation, $panels );
	}
    	
}
