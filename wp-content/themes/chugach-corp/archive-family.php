<?php
get_header(); 

_s_get_template_part( 'template-parts/family', 'archive-hero' );


?>

<div id="primary" class="content-area">

    <main id="main" class="site-main" role="main">
                
        <?php 
        printf( '<div class="column row text-center"><h2 class="share-heading">Share our Vision</h2>%s</div>', _s_get_addtoany_share_icons() );
         
        if ( have_posts() ) :
                   
           
            echo '<div class="row small-up-1 medium-up-2 large-up-3 xlarge-up-4 align-center grid" data-equalizer="panel" data-equalize-on="medium" data-equalize-by-row="true">';
                           
            while ( have_posts() ) :

                the_post();
                
                echo '<div class="column column-block">';
                
                _s_get_template_part( 'template-parts/family', 'archive-column' );
                
                echo '</div>';

            endwhile;
            
            echo '</div>';
            
            $pagination = _s_paginate_links();
            
            printf( '<div class="column row">%s</div>', $pagination );
            
        else :

            get_template_part( 'template-parts/content', 'none' );

        endif; ?>

    </main>

</div>    

<?php
get_footer();
