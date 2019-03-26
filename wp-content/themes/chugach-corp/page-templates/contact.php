<?php
/*
Template Name: Contact
*/


get_header(); ?>

<?php
_s_get_template_part( 'template-parts/global', 'hero' );
?>


<div id="primary" class="content-area">

    <main id="main" class="site-main" role="main">
    <?php
    $form = _s_get_template_part( 'template-parts/contact', 'form', [], true );
    $map = _s_get_template_part( 'template-parts/contact', 'map', [], true );
    $directory = _s_get_template_part( 'template-parts/contact', 'directory', [], true );
    $businesses = _s_get_template_part( 'template-parts/contact', 'businesses', [], true );
    
    printf( '<div class="row"><div class="column">%s</div><div class="column">%s</div></div>',
            $form,
            $map
          );
    
    printf( '<div class="row"><div class="column">%s</div><div class="column">%s</div></div>',
            $directory,
            $businesses
          );
    ?>
    </main>


</div>

<?php
get_footer();
