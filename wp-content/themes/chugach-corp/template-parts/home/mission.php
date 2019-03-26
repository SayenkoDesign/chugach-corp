<?php
// Home - Mission Section

if( ! class_exists( 'Home_Mission_Section' ) ) {
    class Home_Mission_Section extends Element_Section {
                
        public static $section_count;
        
        public function __construct() {
            parent::__construct();               
        }
              
        // Add default attributes to section        
        protected function _add_render_attributes() {
            
            // use parent attributes
            parent::_add_render_attributes();
                                    
            $this->add_render_attribute(
                'wrapper', [
                'data-aos' => 'fade-in', 
                'data-aos-anchor-placement' => 'center-bottom'
             ]
            ); 
                        
        }  
        
        
        
        // Add content
        public function render() {
            
            $fields = $this->get_fields();  
                        
            $header = '';
            $heading = $this->get_fields( 'heading' );
            $description = $this->get_fields( 'description' );
            $photo = $this->get_fields( 'photo' );
            $secondary_photo = $this->get_fields( 'secondary_photo' );
            $subheading = $this->get_fields( 'subheading' );
            $content = $this->get_fields( 'content' );
            $links = $this->get_fields( 'links' );
            
            $delay = 400;
            $increment = 400;
                                    
            #1
            $heading_data_attributes = [
                'class' => '',
                'data-aos' => 0 == self::$section_count % 2 ? 'fade-left' : 'fade-right', 
                'data-aos-delay' => $delay + ( $increment * 1 ),
                'data-aos-anchor' => $this->get_settings( 'aos-anchor' )];
             
            #2
            $description_data_attributes = [
                'data-aos' => 0 == self::$section_count % 2 ? 'fade-right' : 'fade-left', 
                'data-aos-delay' => $delay + ( $increment * 2 ),
                'data-aos-anchor' => $this->get_settings( 'aos-anchor' )]; 
             
             // #3
            $photo_data_attributes = get_data_attributes( [
                'data-aos' => 0 == self::$section_count % 2 ? 'fade-right' : 'fade-left', 
                'data-aos-delay' => $delay + ( $increment * 3 ),
                'data-aos-anchor' => $this->get_settings( 'aos-anchor' )] );
             
             // #4
            $secondary_photo_data_attributes = [
                'class' => 'mission-content__person show-for-large',
                'data-aos' => 0 == self::$section_count % 2 ? 'fade-left' : 'fade-right', 
                'data-aos-delay' => $delay + ( $increment * 4 ),
                'data-aos-anchor' => $this->get_settings( 'aos-anchor' )];
             
             // #5
            $learn_more_data_attributes = get_data_attributes( [
                'data-aos' => 0 == self::$section_count % 2 ? 'fade-left' : 'fade-right', 
                'data-aos-delay' => $delay + ( $increment * 5 ),
                'data-aos-anchor' => $this->get_settings( 'aos-anchor' )] );
                         
            // #6
            $subheading_data_attributes = [
                'data-aos' => 0 == self::$section_count % 2 ? 'fade-left' : 'fade-right', 
                'data-aos-delay' => $delay + ( $increment * 6 ),
                'data-aos-anchor' => $this->get_settings( 'aos-anchor' )];
             
            // #7
            $divider_data_attributes = get_data_attributes( [
                'data-aos' => 0 == self::$section_count % 2 ? 'fade-left' : 'fade-right', 
                'data-aos-delay' => $delay + ( $increment * 7 ),
                'data-aos-anchor' => $this->get_settings( 'aos-anchor' )] );
            
            // #8
            $content_photo_data_attributes = [
                'data-aos' => 'fade-up', 
                'data-aos-delay' => $delay + ( $increment * 8 ),
                'data-aos-anchor' => $this->get_settings( 'aos-anchor' )];   
                
            
            $secondary_photo = _s_get_acf_image( $secondary_photo, 'medium', false, $secondary_photo_data_attributes );
            
            $heading = _s_format_string( $heading, 'h1', $heading_data_attributes );
            $description = _s_format_string( $description, 'h3', $description_data_attributes );
                        
            $photo = sprintf( '<div class="mission-content__image" %s><div class="mission-content__image-wrapper">%s</div></div>', 
                              $photo_data_attributes,
                              _s_get_acf_image( $photo, 'large' ) 
                            );
            
            
            $subheading = _s_format_string( $subheading, 'h2', $subheading_data_attributes );
            
            
            $divider = sprintf( '<div class="divider divider--mission" %s>
                                    <span id="bodyregion_1_homepagecomponents_3_Divider1" class="divider__line--left"></span>
                                    <span id="bodyregion_1_homepagecomponents_3_Divider2" class="divider__arrow divider__arrow--up"></span>
                                    <span id="bodyregion_1_homepagecomponents_3_Divider3" class="divider__line--right"></span>
                                </div>', $divider_data_attributes );
            
            $content = _s_format_string( $content, 'p', $content_photo_data_attributes );
            
            if( ! empty( $links ) ) {
                $items = '';
                foreach( $links as $link ) {
                    $link = $link['link'];
                    $link_url = $link['url'];
	                $link_title = $link['title'];
                    if( ! empty( $link_url ) && ! empty( $link_title ) ) {
                        $items .= sprintf( '<li><a href="%s">%s</a></li>', $link_url, $link_title );
                    }
                }
                
                
                
                if( ! empty( $items ) ) {
                    $links = sprintf( '<div class="links" %s><h5>Learn More</h5><ul>%s</ul></div>', $learn_more_data_attributes, $items );
                }
            }
            
            
            
            return sprintf( '<div class="column row"><article class="mission-content clearfix">
                            <img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" class="circle--background__mobile hide-for-large" alt="Background placeholder">
                            <div class="circle--background show-for-large"></div>
                            
                            <div class="mission-content__navigation has-person show-for-large">
                                %s
                                %s
                            </div>
                            <div class="mission-content__title">
                                <header>
                                    %s
                                    %s
                                </header>
                            </div>
                            %s
                            <div class="mission-content__description">
                                %s
                                %s
                                %s
                            </div>
                            <div class="mission-content__navigation has-person hide-for-large">
                                %s
                            </div>
                            
                        </article></div>',
                        $secondary_photo,
                        $links,
                        $heading,
                        $description,
                        $photo,
                        $subheading,
                        $divider,
                        $content,
                        $links     
            
            );
            
        }
        
    }
}
   
$fields = get_field( 'sections' );

if( ! empty( $fields ) ) {
    foreach( $fields as $key => $field ) {
        $section = new Home_Mission_Section();
        $section->set_fields( $field );
        $section->add_render_attribute( 'wrapper', 'class', $section->get_name() . '-mission' );
        $section->add_render_attribute( 'wrapper', 'class', sprintf( '%s-mission-%s', $section->get_name(), $key ) ); 
        $section->add_render_attribute( 'wrapper', 'id', sprintf( '%s-mission-%s', $section->get_name(), $key ), true ); 
        $section->set_settings( 'aos-anchor', sprintf( '#%s-mission-%s', $section->get_name(), $key ) );
        $section->render();
        $section->print_element();  

    }
}




