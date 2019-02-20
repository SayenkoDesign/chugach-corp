<?php
/*
Template Name: Login
*/

get_header(); 

_s_get_template_part( 'template-parts/global', 'hero' );

?>

<div class="row align-center">

    <div class="large-9 columns">

        <div id="primary" class="content-area">
        
            <main id="main" class="site-main" role="main">
            <?php
                
                while ( have_posts() ) :
        
                    the_post();
                                            
                    _s_get_template_part( 'template-parts/members', 'register-login' );
                        
                endwhile;
                
            
            ?>
            </main>
        
        
        </div>
        
    </div>
        
</div>

<?php
get_footer();
