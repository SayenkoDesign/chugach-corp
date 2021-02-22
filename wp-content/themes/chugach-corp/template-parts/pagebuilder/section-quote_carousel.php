<?php

/*
Careers - Testimonials

*/

if( ! class_exists( 'Pagebuilder_Quotes_Carousel' ) ) {
    class Pagebuilder_Quotes_Carousel extends Element_Section {

        public function __construct() {
            parent::__construct();

            $fields = get_sub_field( 'quotes' );
            $this->set_fields( $fields );

            $this->id = get_sub_field('id');
            $this->class = get_sub_field('class');
            $this->section_title = get_sub_field('section_title');


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
                     $this->get_name() . '-testimonials',
                     'pagebuilder-section',
                     $this->class,
                     $this->get_name() . '-testimonials' . '-' . $this->get_id(),
                ]
            );

            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->id
                ]
            );

            $background_image       = $this->get_fields( 'background_image' );
            $background_position_x  = strtolower( $this->get_fields( 'background_position_x' ) );
            $background_position_y  = strtolower( $this->get_fields( 'background_position_y' ) );
            $background_overlay     = $this->get_fields( 'background_overlay' );

            if( ! empty( $background_image ) ) {
                $background_image = _s_get_acf_image( $background_image, 'hero', true );

                $this->add_render_attribute( 'wrapper', 'style', sprintf( 'background-image: url(%s);', $background_image ) );
                $this->add_render_attribute( 'wrapper', 'style', sprintf( 'background-position: %s %s;',
                                                                          $background_position_x, $background_position_y ) );

                if( true == $background_overlay ) {
                     $this->add_render_attribute( 'wrapper', 'class', 'background-overlay' );
                }

            }
        }

        // Add content
        public function render() {

            $testimonials = $this->get_testimonials();

            if( empty( $testimonials ) ) {
                return false;
            }

            $heading    = $this->section_title ? $this->section_title : '';
            $heading    = _s_format_string( $heading, 'h2' );

            if($heading) {
                return sprintf( '<div class="column row align-middle"><header>%s</header><div class="testimonials"><div class="slick">%s</div></div></div></div>',
                    $heading,
                    join( '', $testimonials )
                    );
            }
            else {
                return sprintf( '<div class="column row align-middle"><div class="testimonials"><div class="slick">%s</div></div></div></div>',
                    join( '', $testimonials )
                    );
            }

        }

        private function get_testimonials() {

            $slides = [];

            while(have_rows('quotes')) : the_row();

                $author = get_sub_field('author');

                $name = $author['name'];
                if( ! empty( $name ) ) {
                    $name = _s_format_string( $name, 'h3' );
                }

                $title = $author['title'];
                if( ! empty( $title ) ) {
                    $title = _s_format_string( $title, 'h5' );
                }

                $thumbnail = '';

                $photo = wp_get_attachment_url( $author['image']['ID'], 'thumbnail' );
                if( ! empty( $photo ) ) {
                    $thumbnail = sprintf( '<div class="thumbnail" style="background-image: url(%s);"></div>', $photo );
                }

                $info = sprintf( '<footer>%s%s%s</footer>', $thumbnail, $name, $title  );

                $slides[] = sprintf( '<div class="testimonial">%s%s</div>',
                                       get_sub_field('quote'),
                                       $info
                                       );

            endwhile;

            // randomize them
            shuffle($slides);

            return $slides;
        }

    }
}

new Pagebuilder_Quotes_Carousel;

