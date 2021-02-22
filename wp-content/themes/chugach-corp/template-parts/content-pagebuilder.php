<?php

if ( have_rows('pagebuilder_sections') ) {

    $section_count = 0;
    while ( have_rows('pagebuilder_sections') ) {
        $section_count = $section_count + 1;

        the_row();

        // Use custom template part function so we can pass data
        _s_get_template_part( 'template-parts/pagebuilder', sprintf( 'section-%s', get_row_layout() ), ['data' => ['section_count' => $section_count] ] );

    } // endwhile have_rows('sections')


} // endif have_rows('sections')
