<?php
// Notification Bar

if( ! class_exists( 'Notification_Bar_Section' ) ) {
    class Notification_Bar_Section extends Element_Section {
        
        var $post_id = 'option';
        
        public function __construct() {
            parent::__construct();
            
            $fields = get_field( 'notification', $this->post_id );
                                                                                                
            $this->set_fields( $fields );  
            
            if( ! empty( $this->render() ) ) {
                $this->filters();  
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
                     $this->get_name() . '-notification-bar', 'hide'
                ]
            ); 
            
            $this->add_render_attribute(
                'wrapper', 'data-closable' ); 
            
            
        }  
        
        
        // Add content
        public function render() {
            
            $show = $this->get_fields( 'show' );
            
            if( ! $show ) {
                return false;
            }
            
            $text = $this->get_fields( 'text' );
            
            if( empty( $text ) ) {
                return false;
            }
            
            $content = $text;
            
            $button = $this->get_fields( 'button' );
                                  
            if( ! empty( $button['url'] ) && ! empty( $button['title'] ) ) {
                $target = ! empty( $button['target'] ) ? sprintf( 'target="%s"', $button['target'] ) : '';
                $content  .= sprintf( '<a href="%s"%s class="read-more">%s</a>', $button['url'], $target, $button['title'] );
            }
            
            $content = _s_format_string( $content, 'p' );
                        
            return sprintf( '<div class="row">
                                <div class="column">%s%s</div>
                            </div>',
                            $content,
                            '<button class="close-button" aria-label="Close alert" type="button" data-close>
                                <span aria-hidden="true">&times;</span>
                              </button>'
                         );  
               
        }
        
        
        private function filters() {
            add_filter( 'body_class', function ( $classes ) {
                $classes[] = 'has-notification-bar';
                // $classes[] = '';
                return $classes;
            }, 99 );
        }
        
    }
}
   
new Notification_Bar_Section;