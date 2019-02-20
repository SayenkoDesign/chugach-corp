<?php
get_header(); 

_s_get_template_part( 'template-parts/books', 'archive-hero' );


?>

<div id="primary" class="content-area">

    <main id="main" class="site-main" role="main">
                
        <?php 

         
        if ( have_posts() ) :
        
           if( function_exists( 'facetwp_display' ) ) {
               
               $edge_top = sprintf( '<div class="edge top"><img src="%sbooks/categories-top-edge.png" /></div>', trailingslashit( THEME_IMG ) );
               $edge_bottom = sprintf( '<div class="edge bottom"><img src="%sbooks/categories-bottom-edge.png" /></div>', trailingslashit( THEME_IMG ) );
               
               printf( '<div class="facetwp-custom-filters">%s<div class="column row align-center"><div class="filters">', $edge_top );
               
               $filters = sprintf( '<button id="book_category_reset" onclick="FWP.reset(\'book_category\')">All</button>%s',  
                                   facetwp_display( 'facet', 'book_category' )
                                 );
                
               printf( '<div class="hide-for-large text-center">
                <button class="button" type="button" data-toggle="book-filters">Filter Books</button>
                 <div class="dropdown-pane center" id="book-filters" data-dropdown data-close-on-click>%s</div></div>', $filters );
                
        
               printf( '<div class="show-for-large">%s</div>', $filters );
                
               printf( '</div></div>%s</div>', $edge_bottom );
                
            }
           
           
           echo '<div class="grid-wrapper" data-equalizer="thumbnail" data-equalize-on="medium">';
           
           echo '<div class="row small-up-1 medium-up-2 large-up-3 xlarge-up-4 grid facetwp-template" data-equalizer="panel" data-equalize-on="medium" data-equalize-by-row="true">';
                           
            while ( have_posts() ) :

                the_post();
                
                echo '<div class="column column-block">';
                
                _s_get_template_part( 'template-parts/books', 'book-column' );
                
                echo '</div>';

            endwhile;
            
            echo '</div>';
            
            echo '</div>';
            
            
            if( function_exists( 'facetwp_display' ) ) {
                $pagination = facetwp_display( 'pager' );
            }
            else {
                $pagination = _s_paginate_links();
            }
            
            printf( '<div class="column row">%s</div>', $pagination );
                            
        else :

            get_template_part( 'template-parts/content', 'none' );

        endif; ?>

    </main>

</div>    

<?php
get_footer();
