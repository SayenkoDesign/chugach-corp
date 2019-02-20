<?php

if ( have_rows('sections') ) {
		
    while ( have_rows('sections') ) { 
    
        the_row();
        
        // Use custom template part function so we can pass data
        _s_get_template_part( 'template-parts/services', sprintf( 'section-%s', get_row_layout() ), ['data' => [] ] );
            
    } // endwhile have_rows('sections')
    

} // endif have_rows('sections')